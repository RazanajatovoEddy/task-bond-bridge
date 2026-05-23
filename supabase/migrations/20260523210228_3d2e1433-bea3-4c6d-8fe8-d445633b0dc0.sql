
-- 1. is_active flags
ALTER TABLE public.consultant_profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2. document_type enum
DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM ('brief','specification','livrable','contrat','devis','facture','bon_de_commande','autre');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. is_document_shared helper
CREATE OR REPLACE FUNCTION public.is_document_shared(_t public.document_type)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT _t IN ('brief','specification','livrable','autre');
$$;

-- 4. project_documents table
CREATE TABLE IF NOT EXISTS public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  document_type public.document_type NOT NULL DEFAULT 'autre',
  name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_request ON public.project_documents(request_id);

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- SELECT: admin, entreprise propriétaire, consultant membre (si partagé)
CREATE POLICY "pd_select_admin" ON public.project_documents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "pd_select_company" ON public.project_documents FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.requests r
  JOIN public.company_profiles cp ON cp.id = r.company_id
  WHERE r.id = project_documents.request_id AND cp.user_id = auth.uid()
));

CREATE POLICY "pd_select_consultant_shared" ON public.project_documents FOR SELECT TO authenticated
USING (
  public.is_document_shared(document_type)
  AND EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.consultant_profiles cs ON cs.id = pm.consultant_id
    WHERE pm.request_id = project_documents.request_id AND cs.user_id = auth.uid()
  )
);

-- INSERT: admin OR entreprise propriétaire
CREATE POLICY "pd_insert_admin" ON public.project_documents FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') AND uploaded_by = auth.uid());

CREATE POLICY "pd_insert_company" ON public.project_documents FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.requests r
    JOIN public.company_profiles cp ON cp.id = r.company_id
    WHERE r.id = project_documents.request_id AND cp.user_id = auth.uid()
  )
);

-- DELETE: admin OR uploader
CREATE POLICY "pd_delete_admin" ON public.project_documents FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "pd_delete_uploader" ON public.project_documents FOR DELETE TO authenticated
USING (uploaded_by = auth.uid());

-- 5. Admin policies on existing tables
CREATE POLICY "cp_admin_select" ON public.consultant_profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cp_admin_update" ON public.consultant_profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "comp_admin_select" ON public.company_profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "comp_admin_update" ON public.company_profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "req_admin_select" ON public.requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "req_admin_update" ON public.requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "req_admin_insert" ON public.requests FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "pm_admin_select" ON public.project_members FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "pm_admin_insert" ON public.project_members FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "pm_admin_delete" ON public.project_members FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "msg_admin_select" ON public.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_admin_select" ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

-- 6. Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents','project-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: rely on project_documents row existence with same access rules
CREATE POLICY "pd_storage_select" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-documents'
  AND EXISTS (
    SELECT 1 FROM public.project_documents pd
    WHERE pd.file_path = storage.objects.name
    -- RLS on project_documents will already filter, but storage RLS is independent.
    -- Replicate the access rules here:
    AND (
      public.has_role(auth.uid(),'admin')
      OR EXISTS (
        SELECT 1 FROM public.requests r
        JOIN public.company_profiles cp ON cp.id = r.company_id
        WHERE r.id = pd.request_id AND cp.user_id = auth.uid()
      )
      OR (
        public.is_document_shared(pd.document_type)
        AND EXISTS (
          SELECT 1 FROM public.project_members pm
          JOIN public.consultant_profiles cs ON cs.id = pm.consultant_id
          WHERE pm.request_id = pd.request_id AND cs.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "pd_storage_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND (
    public.has_role(auth.uid(),'admin')
    OR EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.company_profiles cp ON cp.id = r.company_id
      WHERE cp.user_id = auth.uid()
        AND storage.objects.name LIKE r.id::text || '/%'
    )
  )
);

CREATE POLICY "pd_storage_delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-documents'
  AND (
    public.has_role(auth.uid(),'admin')
    OR EXISTS (
      SELECT 1 FROM public.project_documents pd
      WHERE pd.file_path = storage.objects.name AND pd.uploaded_by = auth.uid()
    )
  )
);

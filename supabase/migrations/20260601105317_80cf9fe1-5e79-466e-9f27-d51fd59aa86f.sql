
-- 1) Privilege escalation: remove self-insert on user_roles, allow admins only.
DROP POLICY IF EXISTS roles_insert_own ON public.user_roles;

CREATE POLICY roles_admin_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- The handle_new_user() trigger is SECURITY DEFINER so it bypasses RLS
-- and continues to seed initial consultant/entreprise roles on signup.

-- 2) Realtime authorization for messages channel.
-- Restrict realtime.messages so only request members can subscribe.
DROP POLICY IF EXISTS "Authenticated can receive request messages" ON realtime.messages;

CREATE POLICY "Authenticated can receive request messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.request_id::text = (realtime.topic())
      AND public.is_request_member(m.request_id, auth.uid())
  )
);

-- 3) Tighten is_document_shared: exclude generic "autre" from consultant access.
CREATE OR REPLACE FUNCTION public.is_document_shared(_t document_type)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT _t IN ('brief','specification','livrable');
$function$;

-- 4) Lock down SECURITY DEFINER helper functions from anon/public callers.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_request_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_document_shared(document_type) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_request_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_document_shared(document_type) TO authenticated;

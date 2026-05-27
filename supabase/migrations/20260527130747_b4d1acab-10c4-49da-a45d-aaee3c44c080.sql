
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  signup_role text := meta->>'signup_role';
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;

  IF signup_role = 'consultant' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'consultant'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.consultant_profiles (user_id, first_name, last_name, specialties, availability)
    VALUES (
      NEW.id,
      COALESCE(meta->>'first_name', ''),
      COALESCE(meta->>'last_name', ''),
      COALESCE(ARRAY(SELECT jsonb_array_elements_text(meta->'specialties')), '{}'::text[]),
      NULLIF(meta->>'availability', '')
    );
  ELSIF signup_role = 'entreprise' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'entreprise'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.company_profiles (user_id, company_name, contact_name, phone)
    VALUES (
      NEW.id,
      COALESCE(meta->>'company_name', ''),
      COALESCE(meta->>'contact_name', ''),
      NULLIF(meta->>'phone', '')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure unique constraint exists for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

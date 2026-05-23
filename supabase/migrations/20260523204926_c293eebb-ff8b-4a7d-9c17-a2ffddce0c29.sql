
ALTER TABLE public.consultant_profiles ADD COLUMN specialties text[] NOT NULL DEFAULT '{}';
UPDATE public.consultant_profiles
  SET specialties = ARRAY(SELECT trim(s) FROM unnest(string_to_array(specialty, ',')) AS s WHERE trim(s) <> '')
  WHERE specialty IS NOT NULL;
ALTER TABLE public.consultant_profiles DROP COLUMN specialty;

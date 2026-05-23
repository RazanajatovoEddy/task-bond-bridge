CREATE OR REPLACE FUNCTION public.is_document_shared(_t public.document_type)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT _t IN ('brief','specification','livrable','autre');
$$;
GRANT EXECUTE ON FUNCTION public.is_request_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
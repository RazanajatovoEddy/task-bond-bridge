
CREATE TYPE public.app_role AS ENUM ('consultant', 'entreprise');
CREATE TYPE public.request_status AS ENUM ('new', 'in_progress', 'waiting', 'done');
CREATE TYPE public.request_type AS ENUM ('automation', 'app', 'other');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "roles_insert_own" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.consultant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  availability TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_select_own" ON public.consultant_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cp_insert_own" ON public.consultant_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp_update_own" ON public.consultant_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comp_select_own" ON public.company_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comp_insert_own" ON public.company_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comp_update_own" ON public.company_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type public.request_type NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  budget TEXT,
  deadline DATE,
  priority TEXT,
  status public.request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, consultant_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_request_member(_request_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.requests r
    JOIN public.company_profiles cp ON cp.id = r.company_id
    WHERE r.id = _request_id AND cp.user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.consultant_profiles cs ON cs.id = pm.consultant_id
    WHERE pm.request_id = _request_id AND cs.user_id = _user_id
  );
$$;

CREATE POLICY "pm_select_if_member" ON public.project_members FOR SELECT TO authenticated
USING (public.is_request_member(request_id, auth.uid()));

CREATE POLICY "req_company_select" ON public.requests FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = company_id AND cp.user_id = auth.uid()));
CREATE POLICY "req_consultant_select" ON public.requests FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.project_members pm JOIN public.consultant_profiles cs ON cs.id = pm.consultant_id WHERE pm.request_id = requests.id AND cs.user_id = auth.uid()));
CREATE POLICY "req_company_insert" ON public.requests FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = company_id AND cp.user_id = auth.uid()));
CREATE POLICY "req_company_update" ON public.requests FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.company_profiles cp WHERE cp.id = company_id AND cp.user_id = auth.uid()));

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select_if_member" ON public.messages FOR SELECT TO authenticated
USING (public.is_request_member(request_id, auth.uid()));
CREATE POLICY "msg_insert_if_member" ON public.messages FOR INSERT TO authenticated
WITH CHECK (sender_user_id = auth.uid() AND public.is_request_member(request_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

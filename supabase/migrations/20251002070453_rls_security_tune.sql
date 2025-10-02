-- Enable RLS on all tables (back again but ignored because we ain't using Supabase auth for now)
-- anyways, just in case we want to in the future :)

ALTER TABLE public.installment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgroup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for api_user (if using backend API) (like before, but with RLS enabled)

CREATE POLICY "api_user_all_access" ON public.installment FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.tenant FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.section FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.subgroup FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.groups FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.member FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.medical_record FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.school_data FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.fee_plan FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.account FOR ALL TO api_user USING (true);
CREATE POLICY "api_user_all_access" ON public.concept FOR ALL TO api_user USING (true);

-- Read-only policies for reader role (SELECT only)
CREATE POLICY "reader_select_only" ON public.installment FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.tenant FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.section FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.subgroup FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.groups FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.member FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.medical_record FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.school_data FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.fee_plan FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.account FOR SELECT TO reader USING (true);
CREATE POLICY "reader_select_only" ON public.concept FOR SELECT TO reader USING (true);
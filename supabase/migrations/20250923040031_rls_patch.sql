-- RLS for logs and dba securityPatch
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slow_query_log ENABLE ROW LEVEL SECURITY;

--service-only access for logs
CREATE POLICY "deny anon and authenticated" ON public.system_log FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

--only dba should consume logs
CREATE POLICY "dba read rate_limit_log" ON public.rate_limit_log FOR SELECT TO authenticated USING ((auth.jwt() ->> 'user_role') = 'dba');
CREATE POLICY "dba delete rate_limit_log" ON public.rate_limit_log FOR DELETE TO authenticated USING ((auth.jwt() ->> 'user_role') = 'dba');

--performance improvement for IDXs
CREATE INDEX ON public.system_log (user_id);

--public.slow_query_log critical security patch using user_id
CREATE POLICY "Allow owner insert" ON public.slow_query_log FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id::text);
CREATE POLICY "Allow owner update" ON public.slow_query_log FOR UPDATE TO authenticated USING ((SELECT auth.uid())::text = user_id::text) WITH CHECK ((SELECT auth.uid())::text = user_id::text);
CREATE POLICY "Allow owner delete" ON public.slow_query_log FOR DELETE TO authenticated USING ((SELECT auth.uid())::text = user_id::text);

REVOKE ALL ON public.slow_query_log FROM anon;

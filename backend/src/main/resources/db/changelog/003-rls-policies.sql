-- ===========================================
--  003 - RLS + POLÍTICAS (usa BIGINT)
--  Requiere que app.tenant_id se establezca en la sesión/conexión.
-- ===========================================

ALTER TABLE public.sections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgroups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- sections
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE policyname = 'sections_tenant_isolation'
      AND schemaname = 'public'
      AND tablename  = 'sections'
  ) THEN
    CREATE POLICY sections_tenant_isolation ON public.sections
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT);
  END IF;

  -- subgroups
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE policyname = 'subgroups_tenant_isolation'
      AND schemaname = 'public'
      AND tablename  = 'subgroups'
  ) THEN
    CREATE POLICY subgroups_tenant_isolation ON public.subgroups
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT);
  END IF;

  -- committees
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE policyname = 'committees_tenant_isolation'
      AND schemaname = 'public'
      AND tablename  = 'committees'
  ) THEN
    CREATE POLICY committees_tenant_isolation ON public.committees
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT);
  END IF;

  -- committee_members
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE policyname = 'committee_members_tenant_isolation'
      AND schemaname = 'public'
      AND tablename  = 'committee_members'
  ) THEN
    CREATE POLICY committee_members_tenant_isolation ON public.committee_members
      USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT)
      WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::BIGINT);
  END IF;
END
$$ LANGUAGE plpgsql;

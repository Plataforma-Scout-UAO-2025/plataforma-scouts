-- ===========================================
-- 004 - MIGRAR SERIAL/INTEGER -> BIGINT
-- Idempotente con Liquibase
-- ===========================================
BEGIN;

-- 0) Quitar políticas RLS que bloquean el cambio de tipo
DROP POLICY IF EXISTS sections_tenant_isolation          ON public.sections;
DROP POLICY IF EXISTS subgroups_tenant_isolation         ON public.subgroups;
DROP POLICY IF EXISTS committees_tenant_isolation        ON public.committees;
DROP POLICY IF EXISTS committee_members_tenant_isolation ON public.committee_members;

-- (opcional) deshabilitar RLS durante la migración
ALTER TABLE public.sections          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgroups         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members DISABLE ROW LEVEL SECURITY;

-- 1) Soltar FKs
ALTER TABLE IF EXISTS public.subgroups         DROP CONSTRAINT IF EXISTS subgroups_section_id_fkey;
ALTER TABLE IF EXISTS public.subgroups         DROP CONSTRAINT IF EXISTS subgroups_tenant_id_fkey;
ALTER TABLE IF EXISTS public.sections          DROP CONSTRAINT IF EXISTS sections_tenant_id_fkey;
ALTER TABLE IF EXISTS public.committees        DROP CONSTRAINT IF EXISTS committees_tenant_id_fkey;
ALTER TABLE IF EXISTS public.committee_members DROP CONSTRAINT IF EXISTS committee_members_committee_id_fkey;
ALTER TABLE IF EXISTS public.committee_members DROP CONSTRAINT IF EXISTS committee_members_tenant_id_fkey;

-- 2) Cambiar tipos de PKs y FKs a BIGINT
ALTER TABLE public.tenants           ALTER COLUMN tenant_id           TYPE BIGINT;

ALTER TABLE public.sections          ALTER COLUMN section_id          TYPE BIGINT;
ALTER TABLE public.sections          ALTER COLUMN tenant_id           TYPE BIGINT USING tenant_id::BIGINT;

ALTER TABLE public.subgroups         ALTER COLUMN subgroup_id         TYPE BIGINT;
ALTER TABLE public.subgroups         ALTER COLUMN tenant_id           TYPE BIGINT USING tenant_id::BIGINT;
ALTER TABLE public.subgroups         ALTER COLUMN section_id          TYPE BIGINT USING section_id::BIGINT;

ALTER TABLE public.committees        ALTER COLUMN committee_id        TYPE BIGINT;
ALTER TABLE public.committees        ALTER COLUMN tenant_id           TYPE BIGINT USING tenant_id::BIGINT;

ALTER TABLE public.committee_members ALTER COLUMN committee_member_id TYPE BIGINT;
ALTER TABLE public.committee_members ALTER COLUMN tenant_id           TYPE BIGINT USING tenant_id::BIGINT;
ALTER TABLE public.committee_members ALTER COLUMN committee_id        TYPE BIGINT USING committee_id::BIGINT;
ALTER TABLE public.committee_members ALTER COLUMN user_id             TYPE BIGINT USING user_id::BIGINT;

-- 3) Recrear FKs
ALTER TABLE public.sections
  ADD CONSTRAINT sections_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE;

ALTER TABLE public.subgroups
  ADD CONSTRAINT subgroups_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE,
  ADD CONSTRAINT subgroups_section_id_fkey
  FOREIGN KEY (section_id) REFERENCES public.sections (section_id) ON DELETE CASCADE;

ALTER TABLE public.committees
  ADD CONSTRAINT committees_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE;

ALTER TABLE public.committee_members
  ADD CONSTRAINT committee_members_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE,
  ADD CONSTRAINT committee_members_committee_id_fkey
  FOREIGN KEY (committee_id) REFERENCES public.committees (committee_id) ON DELETE CASCADE;

-- 4) Volver a habilitar RLS y recrear políticas (ya con ::bigint)
ALTER TABLE public.sections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subgroups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY sections_tenant_isolation ON public.sections
  USING (tenant_id = current_setting('app.tenant_id', true)::bigint)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::bigint);

CREATE POLICY subgroups_tenant_isolation ON public.subgroups
  USING (tenant_id = current_setting('app.tenant_id', true)::bigint)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::bigint);

CREATE POLICY committees_tenant_isolation ON public.committees
  USING (tenant_id = current_setting('app.tenant_id', true)::bigint)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::bigint);

CREATE POLICY committee_members_tenant_isolation ON public.committee_members
  USING (tenant_id = current_setting('app.tenant_id', true)::bigint)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::bigint);

COMMIT;

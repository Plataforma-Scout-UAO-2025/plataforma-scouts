-- ===========================================
--  002 - SUBGROUPS, COMMITTEES, MEMBERS (idempotente)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.subgroups (
  subgroup_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id      BIGINT  NOT NULL,
  section_id     BIGINT  NOT NULL,
  subgroup_name  VARCHAR(100) NOT NULL,
  subgroup_type  VARCHAR(50),
  creation_date  DATE,
  is_active      BOOLEAN DEFAULT TRUE,
  CONSTRAINT subgroups_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE,
  CONSTRAINT subgroups_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.sections (section_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subgroups_tenant         ON public.subgroups (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subgroups_tenant_section ON public.subgroups (tenant_id, section_id);

CREATE TABLE IF NOT EXISTS public.committees (
  committee_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id      BIGINT NOT NULL,
  committee_name  VARCHAR(100) NOT NULL,
  committee_level VARCHAR(50)  NOT NULL,
  description     TEXT,
  CONSTRAINT committees_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_committees_tenant ON public.committees (tenant_id);

CREATE TABLE IF NOT EXISTS public.committee_members (
  committee_member_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id           BIGINT NOT NULL,
  committee_id        BIGINT NOT NULL,
  user_id             BIGINT,
  committee_role      VARCHAR(50),
  start_date          DATE,
  end_date            DATE,
  CONSTRAINT committee_members_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE,
  CONSTRAINT committee_members_committee_id_fkey
    FOREIGN KEY (committee_id) REFERENCES public.committees (committee_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cmembers_tenant ON public.committee_members (tenant_id);

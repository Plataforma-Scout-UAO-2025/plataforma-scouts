-- ===========================================
--  001 - TENANTS & SECTIONS (idempotente)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_name              VARCHAR(100) NOT NULL,
  group_number            VARCHAR(10),
  parent_association_name VARCHAR(100),
  logo_url                VARCHAR(255),
  scarf_url               VARCHAR(255),
  motto                   VARCHAR(255),
  foundation_date         DATE
);

CREATE TABLE IF NOT EXISTS public.sections (
  section_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id       BIGINT NOT NULL,
  standard_name   VARCHAR(50)  NOT NULL,
  group_specific_name VARCHAR(100),
  program_description  TEXT,
  section_logo_url     VARCHAR(255),
  section_flag_url     VARCHAR(255),
  section_yell         TEXT,
  call_method          VARCHAR(100),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sections_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES public.tenants (tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_tenant ON public.sections (tenant_id);
CREATE INDEX IF NOT EXISTS idx_sections_name   ON public.sections (standard_name);

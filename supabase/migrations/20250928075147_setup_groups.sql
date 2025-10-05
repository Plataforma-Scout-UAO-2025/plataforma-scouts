-- =======================
-- TENANT
-- =======================
CREATE TABLE tenant (
  tenant_id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  status text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- =======================
-- GROUPS
-- =======================
CREATE TABLE groups (
  group_id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  district text,
  identifier_number text,
  address text,
  phone text,
  email text,
  founded_in date,
  motto text,
  mission text,
  vision text,
  history text,
  status text,
  logo_object_id uuid,
  scarf_object_id uuid,
  social_links jsonb,
  config jsonb,
  is_active bool DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT fk_groups_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT uq_groups_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- Índices
CREATE INDEX idx_groups_tenant_id ON groups(tenant_id);
CREATE INDEX idx_groups_tenant_slug ON groups(tenant_id, slug);

-- =======================
-- SECTION
-- =======================
CREATE TABLE section (
  section_id bigserial PRIMARY KEY,
  group_id bigint NOT NULL,
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text,
  icon_object_id uuid,
  gallery_object_id uuid,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT fk_section_group FOREIGN KEY (group_id) REFERENCES groups (group_id),
  CONSTRAINT fk_section_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT uq_section_name_per_group UNIQUE (tenant_id, group_id, name)
);

-- Índices
CREATE INDEX idx_section_tenant_id ON section(tenant_id);
CREATE INDEX idx_section_group_id ON section(group_id);
CREATE INDEX idx_section_tenant_group_id ON section(tenant_id, group_id);

-- =======================
-- SUBGROUP
-- =======================
CREATE TABLE subgroup (
  subgroup_id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  group_id bigint NOT NULL,
  section_id bigint NOT NULL,
  name text NOT NULL,
  description text,
  is_active bool DEFAULT true,
  gallery_object_id uuid,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT fk_subgroup_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id),
  CONSTRAINT fk_subgroup_group FOREIGN KEY (group_id) REFERENCES groups (group_id),
  CONSTRAINT fk_subgroup_section FOREIGN KEY (section_id) REFERENCES section (section_id),
  CONSTRAINT uq_subgroup_name_per_section UNIQUE (tenant_id, group_id, section_id, name)
);

-- Índices
CREATE INDEX idx_subgroup_tenant_id ON subgroup(tenant_id);
CREATE INDEX idx_subgroup_group_id ON subgroup(group_id);
CREATE INDEX idx_subgroup_section_id ON subgroup(section_id);
CREATE INDEX idx_subgroup_tenant_group_section_id ON subgroup(tenant_id, group_id, section_id);
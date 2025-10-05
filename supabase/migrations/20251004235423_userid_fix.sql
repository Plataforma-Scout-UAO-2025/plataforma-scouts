-- Convert user_id from VARCHAR(200) to TEXT and tenant_id from BIGINT to TEXT

-- Necesario para manejar la migración de tenant_id de BIGINT a TEXT como quedamos en la reunión,
-- user_id de VARCHAR(200) a TEXT en todas las tablas relacionadas.
-- Asegura que todas las FKs se actualicen correctamente.

BEGIN;

-- Drop all foreign key constraints that reference tenant_id
ALTER TABLE account DROP CONSTRAINT IF EXISTS fk_account_tenant;
ALTER TABLE concept DROP CONSTRAINT IF EXISTS fk_concept_tenant;
ALTER TABLE fee_plan DROP CONSTRAINT IF EXISTS fk_fee_plan_tenant;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS fk_groups_tenant;
ALTER TABLE installment DROP CONSTRAINT IF EXISTS fk_installment_tenant;
ALTER TABLE medical_record DROP CONSTRAINT IF EXISTS fk_medical_record_tenant;
ALTER TABLE member DROP CONSTRAINT IF EXISTS fk_member_tenant;
ALTER TABLE school_data DROP CONSTRAINT IF EXISTS fk_school_data_tenant;
ALTER TABLE section DROP CONSTRAINT IF EXISTS fk_section_tenant;
ALTER TABLE subgroup DROP CONSTRAINT IF EXISTS fk_subgroup_tenant;

-- Convert tenant.tenant_id to TEXT
ALTER TABLE tenant ADD COLUMN new_tenant_id TEXT;
UPDATE tenant SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE tenant DROP CONSTRAINT IF EXISTS tenant_pkey;
ALTER TABLE tenant DROP COLUMN tenant_id;
ALTER TABLE tenant RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE tenant ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tenant ADD CONSTRAINT tenant_pkey PRIMARY KEY (tenant_id);

-- Convert tenant_id in all related tables
-- account table
ALTER TABLE account ADD COLUMN new_tenant_id TEXT;
UPDATE account SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE account DROP COLUMN tenant_id;
ALTER TABLE account RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE account ALTER COLUMN tenant_id SET NOT NULL;

-- concept table
ALTER TABLE concept ADD COLUMN new_tenant_id TEXT;
UPDATE concept SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE concept DROP COLUMN tenant_id;
ALTER TABLE concept RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE concept ALTER COLUMN tenant_id SET NOT NULL;

-- fee_plan table
ALTER TABLE fee_plan ADD COLUMN new_tenant_id TEXT;
UPDATE fee_plan SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE fee_plan DROP COLUMN tenant_id;
ALTER TABLE fee_plan RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE fee_plan ALTER COLUMN tenant_id SET NOT NULL;

-- groups table
ALTER TABLE groups ADD COLUMN new_tenant_id TEXT;
UPDATE groups SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE groups DROP COLUMN tenant_id;
ALTER TABLE groups RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE groups ALTER COLUMN tenant_id SET NOT NULL;

-- installment table
ALTER TABLE installment ADD COLUMN new_tenant_id TEXT;
UPDATE installment SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE installment DROP COLUMN tenant_id;
ALTER TABLE installment RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE installment ALTER COLUMN tenant_id SET NOT NULL;

-- medical_record table
ALTER TABLE medical_record ADD COLUMN new_tenant_id TEXT;
UPDATE medical_record SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE medical_record DROP COLUMN tenant_id;
ALTER TABLE medical_record RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE medical_record ALTER COLUMN tenant_id SET NOT NULL;

-- member table
ALTER TABLE member ADD COLUMN new_tenant_id TEXT;
UPDATE member SET new_tenant_id = tenant_id::TEXT;
-- Drop the unique constraint that includes tenant_id
ALTER TABLE member DROP CONSTRAINT IF EXISTS uq_member_identification_per_tenant;
ALTER TABLE member DROP COLUMN tenant_id;
ALTER TABLE member RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE member ALTER COLUMN tenant_id SET NOT NULL;

-- school_data table
ALTER TABLE school_data ADD COLUMN new_tenant_id TEXT;
UPDATE school_data SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE school_data DROP COLUMN tenant_id;
ALTER TABLE school_data RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE school_data ALTER COLUMN tenant_id SET NOT NULL;

-- section table
ALTER TABLE section ADD COLUMN new_tenant_id TEXT;
UPDATE section SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE section DROP COLUMN tenant_id;
ALTER TABLE section RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE section ALTER COLUMN tenant_id SET NOT NULL;

-- subgroup table
ALTER TABLE subgroup ADD COLUMN new_tenant_id TEXT;
UPDATE subgroup SET new_tenant_id = tenant_id::TEXT;
ALTER TABLE subgroup DROP COLUMN tenant_id;
ALTER TABLE subgroup RENAME COLUMN new_tenant_id TO tenant_id;
ALTER TABLE subgroup ALTER COLUMN tenant_id SET NOT NULL;

-- Re-create all FKs for tenant_id
ALTER TABLE account ADD CONSTRAINT fk_account_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE concept ADD CONSTRAINT fk_concept_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE fee_plan ADD CONSTRAINT fk_fee_plan_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE groups ADD CONSTRAINT fk_groups_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE installment ADD CONSTRAINT fk_installment_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE medical_record ADD CONSTRAINT fk_medical_record_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE member ADD CONSTRAINT fk_member_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE school_data ADD CONSTRAINT fk_school_data_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE section ADD CONSTRAINT fk_section_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);
ALTER TABLE subgroup ADD CONSTRAINT fk_subgroup_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id);

-- Re-create the unique constraint for member with new TEXT tenant_id
ALTER TABLE member ADD CONSTRAINT uq_member_identification_per_tenant UNIQUE (tenant_id, identification);

-- ===
-- Convert user_id from VARCHAR(200) to TEXT
-- ===

-- Convert member.user_id to TEXT
ALTER TABLE member ALTER COLUMN user_id TYPE TEXT;

-- Convert user_id in all related tables
ALTER TABLE account ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE fee_plan ALTER COLUMN target_user_id TYPE TEXT;
ALTER TABLE medical_record ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE school_data ALTER COLUMN user_id TYPE TEXT;

-- Drop and recreate tenant_id indexes
DROP INDEX IF EXISTS idx_member_tenant_id;
DROP INDEX IF EXISTS idx_member_tenant_subgroup_id;

CREATE INDEX idx_member_tenant_id ON member USING btree (tenant_id);
CREATE INDEX idx_member_tenant_subgroup_id ON member USING btree (tenant_id, subgroup_id);

COMMIT;
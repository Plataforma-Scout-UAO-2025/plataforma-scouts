-- Replace member_id (bigint) with user_id (VARCHAR(200))

-- La columna user_id contendrá los IDs de usuario de Supabase Auth (UUIDs como texto)
-- y se usará como la nueva clave primaria en la tabla member.
-- Todas las tablas que referencian member_id deben actualizarse para referenciar user_id.

-- Drop all FK constraints that reference member.member_id
ALTER TABLE account 
DROP CONSTRAINT IF EXISTS fk_account_member;

ALTER TABLE fee_plan 
DROP CONSTRAINT IF EXISTS fee_plan_target_member_id_fkey;

ALTER TABLE medical_record 
DROP CONSTRAINT IF EXISTS fk_medical_record_member;

ALTER TABLE school_data 
DROP CONSTRAINT IF EXISTS fk_school_data_member;

-- Drop the old user_id column if it exists (the UUID one from your original schema)
ALTER TABLE member 
DROP COLUMN IF EXISTS user_id;

-- Drop the userid column if it exists (appears to be a duplicate/typo)
ALTER TABLE member 
DROP COLUMN IF EXISTS userid;

-- Add new user_id column as VARCHAR(200)
ALTER TABLE member 
ADD COLUMN user_id VARCHAR(200);

-- Populate user_id with member_id values (convert bigint to text)
UPDATE member 
SET user_id = member_id::TEXT;

-- Make user_id NOT NULL and set it as the new primary key
ALTER TABLE member 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE member 
DROP CONSTRAINT IF EXISTS member_pkey;

ALTER TABLE member 
ADD CONSTRAINT member_pkey PRIMARY KEY (user_id);

-- Drop the old member_id column
ALTER TABLE member 
DROP COLUMN member_id;

-- Update FK columns in related tables to VARCHAR(200)
-- account table
ALTER TABLE account 
ADD COLUMN new_user_id VARCHAR(200);

UPDATE account 
SET new_user_id = member_id::TEXT;

ALTER TABLE account 
DROP COLUMN member_id;

ALTER TABLE account 
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE account 
ALTER COLUMN user_id SET NOT NULL;

-- fee_plan table
ALTER TABLE fee_plan 
ADD COLUMN new_target_user_id VARCHAR(200);

UPDATE fee_plan 
SET new_target_user_id = target_member_id::TEXT 
WHERE target_member_id IS NOT NULL;

ALTER TABLE fee_plan 
DROP COLUMN target_member_id;

ALTER TABLE fee_plan 
RENAME COLUMN new_target_user_id TO target_user_id;

-- medical_record table
ALTER TABLE medical_record 
ADD COLUMN new_user_id VARCHAR(200);

UPDATE medical_record 
SET new_user_id = member_id::TEXT;

ALTER TABLE medical_record 
DROP COLUMN member_id;

ALTER TABLE medical_record 
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE medical_record 
ALTER COLUMN user_id SET NOT NULL;

-- school_data table
ALTER TABLE school_data 
ADD COLUMN new_user_id VARCHAR(200);

UPDATE school_data 
SET new_user_id = member_id::TEXT;

ALTER TABLE school_data 
DROP COLUMN member_id;

ALTER TABLE school_data 
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE school_data 
ALTER COLUMN user_id SET NOT NULL;

-- Re-create all FK constraints with the new column
ALTER TABLE account 
ADD CONSTRAINT fk_account_member FOREIGN KEY (user_id) REFERENCES member(user_id);

ALTER TABLE fee_plan 
ADD CONSTRAINT fee_plan_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES member(user_id);

ALTER TABLE medical_record 
ADD CONSTRAINT fk_medical_record_member FOREIGN KEY (user_id) REFERENCES member(user_id);

ALTER TABLE school_data 
ADD CONSTRAINT fk_school_data_member FOREIGN KEY (user_id) REFERENCES member(user_id);

-- Drop the sequence since we're no longer using auto-increment
DROP SEQUENCE IF EXISTS member_member_id_seq;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_member_tenant_id ON member USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_member_subgroup_id ON member USING btree (subgroup_id);
CREATE INDEX IF NOT EXISTS idx_member_tenant_subgroup_id ON member USING btree (tenant_id, subgroup_id);

-- Add unique constraint for identification per tenant (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_member_identification_per_tenant'
    ) THEN
        ALTER TABLE member 
        ADD CONSTRAINT uq_member_identification_per_tenant UNIQUE (tenant_id, identification);
    END IF;
END $$;
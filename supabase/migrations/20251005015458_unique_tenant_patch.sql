-- Add unique constraints to support idempotent seed operations

-- opcional, agrego la restricción única en groups (tenant_id, slug)
-- nos permite cláusulas ON CONFLICT en los scripts de seed para evitar errores
-- y asegurar que los seeds se puedan ejecutar múltiples veces sin fallar.

-- Add unique constraint on groups (tenant_id, slug)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_groups_tenant_slug'
    ) THEN
        ALTER TABLE groups 
        ADD CONSTRAINT uq_groups_tenant_slug UNIQUE (tenant_id, slug);
    END IF;
END $$;

-- Add unique constraint on section (tenant_id, group_id, name)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_section_tenant_group_name'
    ) THEN
        ALTER TABLE section 
        ADD CONSTRAINT uq_section_tenant_group_name UNIQUE (tenant_id, group_id, name);
    END IF;
END $$;

-- Add unique constraint on subgroup (tenant_id, section_id, name)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_subgroup_tenant_section_name'
    ) THEN
        ALTER TABLE subgroup 
        ADD CONSTRAINT uq_subgroup_tenant_section_name UNIQUE (tenant_id, section_id, name);
    END IF;
END $$;
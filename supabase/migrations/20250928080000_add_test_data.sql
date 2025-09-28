-- =======================
-- ADD TEST DATA
-- =======================

-- Add 5 Tenants
INSERT INTO tenant (slug, status) VALUES
('tenant-1', 'active'),
('tenant-2', 'active'),
('tenant-3', 'inactive'),
('tenant-4', 'active'),
('tenant-5', 'active');

-- Add 5 Groups
INSERT INTO groups (tenant_id, slug, name, status) VALUES
(1, 'group-1', 'Grupo 1', 'active'),
(2, 'group-2', 'Grupo 2', 'active'),
(3, 'group-3', 'Grupo 3', 'inactive'),
(4, 'group-4', 'Grupo 4', 'active'),
(5, 'group-5', 'Grupo 5', 'active');

-- Add 2 Sections for Group 1
INSERT INTO section (group_id, tenant_id, name) VALUES
(1, 1, 'Sección 1'),
(1, 1, 'Sección 2');

-- Add 2 Subgroups for Section 1 of Group 1
INSERT INTO subgroup (tenant_id, group_id, section_id, name) VALUES
(1, 1, 1, 'Subgrupo 1'),
(1, 1, 1, 'Subgrupo 2');
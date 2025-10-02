-- CRUD again lol
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant TO "api_user";

-- Sequence permissions for tenant_id
GRANT USAGE, SELECT, UPDATE ON SEQUENCE tenant_tenant_id_seq TO "api_user";

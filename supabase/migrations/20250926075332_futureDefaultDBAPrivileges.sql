-- Ensure the dba role has USAGE and CREATE on the public schema (in case it was missed)
GRANT USAGE ON SCHEMA public TO dba;
GRANT CREATE ON SCHEMA public TO dba;

-- Grant ALL privileges on ALL *existing* objects in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dba;

-- Set default privileges for ALL *future* objects created by the owner
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO dba;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO dba;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO dba;

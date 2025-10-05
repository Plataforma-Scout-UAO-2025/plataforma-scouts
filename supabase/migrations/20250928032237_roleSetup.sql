-- User and Role Creations

-- 1. Create 'reader' role conditionally
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'reader'
    ) THEN
        CREATE ROLE reader WITH LOGIN PASSWORD '${READER_PASS}';
    END IF;
END
$$;

----------------------------------------------------------------------

-- 2. Create 'api_user' role conditionally
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'api_user'
    ) THEN
        CREATE ROLE api_user WITH LOGIN PASSWORD '${API_USER_PASS}';
    END IF;
END
$$;

----------------------------------------------------------------------

-- 3. Create 'dba' role conditionally
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles
        WHERE rolname = 'dba'
    ) THEN
        -- Using the variable in the password definition
        CREATE ROLE dba WITH LOGIN PASSWORD '${DBA_PASS}';
    END IF;
END
$$;

-- dba rls bypass
ALTER USER dba WITH BYPASSRLS;

-- Grants for dba
GRANT USAGE ON SCHEMA public TO dba;
GRANT CREATE ON SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA public TO dba;

-- Default Privileges for dba
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO dba;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO dba;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO dba;

-- Grants for reader
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;

-- Default Privileges for reader
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reader;

-- Grants for api_user (data manipulation only, no schema changes)
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO api_user;

-- Default Privileges for api_user (future tables and sequences)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO api_user;

-- Grants for authenticated
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
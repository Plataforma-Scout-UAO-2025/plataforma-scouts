-- Role Setup and Initial Grants

-- This migration creates three roles: reader, api_user, and dba.
-- It also assigns appropriate privileges to each role.

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
        CREATE ROLE dba WITH LOGIN PASSWORD '${DBA_PASS}';
    END IF;
END
$$;

----------------------------------------------------------------------
-- DBA ROLE GRANTS (ADMINISTRATIVE ACCESS)
----------------------------------------------------------------------

-- NOTE: The 'dba' role is a powerful admin role. 
-- DO NOT use this role for general application connections.
-- The built-in 'postgres' role already has superuser access.

-- Grants for dba
GRANT USAGE ON SCHEMA public TO dba;
GRANT CREATE ON SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dba;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dba;

-- Default Privileges for dba (for future objects created in public schema)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO dba;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO dba;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO dba;

----------------------------------------------------------------------
-- READER ROLE GRANTS (READ-ONLY ACCESS)
----------------------------------------------------------------------

-- Grants for reader
GRANT USAGE ON SCHEMA public TO reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;

-- Default Privileges for reader
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reader;

----------------------------------------------------------------------
-- API_USER ROLE GRANTS (APPLICATION CRUD ACCESS - NO DELETE)
----------------------------------------------------------------------

-- Grants for api_user (SELECT, INSERT, UPDATE only - no DELETE or schema changes)
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO api_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO api_user;

-- Default Privileges for api_user (future tables and sequences)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO api_user;

----------------------------------------------------------------------
-- AUTHENTICATED ROLE (System Role - ONLY RLS SHOULD GOVERN ACCESS)
----------------------------------------------------------------------

-- Access for authenticated users MUST be controlled via Row Level Security (RLS).
-- Only grant minimal permissions needed for system functions (like ID generation).
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
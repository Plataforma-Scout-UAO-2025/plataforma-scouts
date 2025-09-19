CREATE ROLE "dba" WITH LOGIN PASSWORD '${DBA_PASSWORD}';

-- Grant privileges on the public schema.
GRANT USAGE ON SCHEMA public TO "dba";

-- Grant all privileges on all existing tables, sequences, functions, and procedures.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "dba";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "dba";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "dba";
GRANT ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA public TO "dba";

-- Set default privileges to ensure that all new objects created by the `postgres` user are available to dba
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO "dba";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO "dba";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO "dba";

-- update user pass as best practice ;)
ALTER ROLE "dba" WITH PASSWORD '${DBA_PASSWORD}';

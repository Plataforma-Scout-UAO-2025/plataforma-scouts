-- Permisos sobre el schema storage
GRANT USAGE ON SCHEMA storage TO api_user;

-- Permisos de lectura/escritura en todas las tablas del schema storage
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO api_user;

-- Permisos sobre secuencias (necesario para inserts con IDs autoincrementales)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA storage TO api_user;

-- Para que futuros objetos también tengan permisos automáticamente
ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO api_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO api_user;
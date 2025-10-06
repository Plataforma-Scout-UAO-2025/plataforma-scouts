-- Este script se ejecutará automáticamente antes de las pruebas de @DataJpaTest
-- para configurar la base de datos H2.

CREATE DOMAIN IF NOT EXISTS JSONB AS JSON;
CREATE DOMAIN IF NOT EXISTS "uuid[]" AS VARCHAR;
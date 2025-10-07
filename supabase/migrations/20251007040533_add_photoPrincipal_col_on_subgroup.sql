-- Alter table para agregar la columna photo_principal a subgroup

BEGIN;

ALTER TABLE public.subgroup
ADD COLUMN IF NOT EXISTS photo_principal uuid;

-- (Re)crear la FK de forma idempotente
ALTER TABLE public.subgroup
DROP CONSTRAINT IF EXISTS subgroup_photo_principal_fkey;

ALTER TABLE public.subgroup
ADD CONSTRAINT subgroup_photo_principal_fkey
FOREIGN KEY (photo_principal) REFERENCES storage.objects (id);

COMMIT;
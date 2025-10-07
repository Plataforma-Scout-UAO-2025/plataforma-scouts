-- Columna
BEGIN;

ALTER TABLE public.section
ADD COLUMN IF NOT EXISTS photo_principal uuid;

-- (Re)crear la FK de forma idempotente
ALTER TABLE public.section
DROP CONSTRAINT IF EXISTS section_photo_principal_fkey;

ALTER TABLE public.section
ADD CONSTRAINT section_photo_principal_fkey
FOREIGN KEY (photo_principal) REFERENCES storage.objects (id);

COMMIT;
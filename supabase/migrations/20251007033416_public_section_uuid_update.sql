-- Quitar posible FK previa sobre el uuid simple
BEGIN;

ALTER TABLE public.section
DROP CONSTRAINT IF EXISTS section_gallery_object_id_fkey;

-- Migrar tipo: de uuid -> uuid[]
ALTER TABLE public.section
ALTER COLUMN gallery_object_id TYPE uuid[]
USING (
  CASE
    WHEN gallery_object_id IS NULL THEN ARRAY[]::uuid[]
    ELSE ARRAY[gallery_object_id]::uuid[]
  END
);

-- Colocar default y (opcional) not null
ALTER TABLE public.section
ALTER COLUMN gallery_object_id SET DEFAULT ARRAY[]::uuid[];

COMMIT;
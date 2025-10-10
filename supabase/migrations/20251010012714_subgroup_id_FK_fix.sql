-- This migration fixes the foreign key constraint on the subgroup_id column in the member table.

BEGIN;
-- Hacer member.subgroup_id nullable
-- settea a NULL cualquier subgroup_id que ya no tenga un subgroup

UPDATE public.member m
SET subgroup_id = NULL
WHERE subgroup_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.subgroup s WHERE s.subgroup_id = m.subgroup_id);

-- DROP a FK existente si está presente (idempotencia pues)
ALTER TABLE public.member
  DROP CONSTRAINT IF EXISTS fk_member_subgroup;

-- hacer la columna nullable
ALTER TABLE public.member
  ALTER COLUMN subgroup_id DROP NOT NULL;

-- recrear la FK para que al borrar un subgroup se ponga a NULL el member.subgroup_id
ALTER TABLE public.member
  ADD CONSTRAINT fk_member_subgroup FOREIGN KEY (subgroup_id) REFERENCES public.subgroup(subgroup_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

COMMIT;

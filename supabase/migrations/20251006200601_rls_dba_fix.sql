-- Add RLS policies for dba role
-- The dba role needs full access to all tables for administrative tasks

-- Establecer políticas de RLS para el rol dba
-- (era necesario ya que dba necesita acceso completo a todas las tablas para tareas administrativas)

BEGIN;

-- Create policies for dba role
CREATE POLICY "dba_all_access" ON public.installment FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.tenant FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.section FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.subgroup FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.groups FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.member FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.medical_record FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.school_data FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.fee_plan FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.account FOR ALL TO dba USING (true);
CREATE POLICY "dba_all_access" ON public.concept FOR ALL TO dba USING (true);

COMMIT;
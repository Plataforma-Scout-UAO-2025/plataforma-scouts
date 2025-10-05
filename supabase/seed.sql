-- Inicia una transacción para asegurar que todos los comandos se ejecuten correctamente.
BEGIN;

-- Declaración de variables para almacenar los IDs generados.
DO $$
DECLARE
    -- IDs principales (now TEXT instead of bigint)
    v_tenant_id TEXT;
    v_group_id bigint;

    -- ID para la sección y el subgrupo de Staff
    v_staff_section_id bigint;
    v_staff_subgroup_id bigint;

    -- IDs para Cachorros
    v_cachorros_section_id bigint;
    v_camada_sol_subgroup_id bigint;
    v_camada_luna_subgroup_id bigint;

    -- IDs para Manada
    v_manada_section_id bigint;
    v_seisena_amarilla_subgroup_id bigint;
    v_seisena_verde_subgroup_id bigint;

    -- IDs para Webelos
    v_webelos_section_id bigint;
    v_patrulla_tigres_subgroup_id bigint;
    v_patrulla_panteras_subgroup_id bigint;

    -- IDs para Tropa
    v_tropa_section_id bigint;
    v_patrulla_aguilas_subgroup_id bigint;
    v_patrulla_lobos_subgroup_id bigint;

    -- IDs para Clan
    v_clan_section_id bigint;
    v_clan_alfa_subgroup_id bigint;
    v_clan_beta_subgroup_id bigint;

BEGIN
    -- 1. Insertar el Tenant principal (tenant_id is now TEXT)
    -- Generate a UUID-based tenant_id for consistency
    v_tenant_id := gen_random_uuid()::TEXT;
    
    INSERT INTO public.tenant (tenant_id, slug, status)
    VALUES (v_tenant_id, 'region-ejemplo', 'active');

    -- 2. Insertar el Grupo Scout
    INSERT INTO public.groups (tenant_id, slug, name, identifier_number, is_active)
    VALUES (v_tenant_id, 'grupo-scout-centinelas-113', 'Grupo Scout Centinelas 113', '113', true)
    RETURNING group_id INTO v_group_id;

    -- 3. Crear Secciones y Subgrupos
    
    -- 3.1. Sección de Staff para roles directivos
    INSERT INTO public.section (tenant_id, group_id, name)
    VALUES (v_tenant_id, v_group_id, 'Staff')
    RETURNING section_id INTO v_staff_section_id;

    -- Subgrupo único para todos los roles de Staff
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name)
    VALUES (v_tenant_id, v_group_id, v_staff_section_id, 'Staff General')
    RETURNING subgroup_id INTO v_staff_subgroup_id;

    -- 3.2. Sección Cachorros (5-7 años)
    INSERT INTO public.section (tenant_id, group_id, name, description)
    VALUES (v_tenant_id, v_group_id, 'Cachorros', 'Edades de 5 a 7 años')
    RETURNING section_id INTO v_cachorros_section_id;

    -- Subgrupos de Cachorros
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_cachorros_section_id, 'Camada Sol') 
    RETURNING subgroup_id INTO v_camada_sol_subgroup_id;
    
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_cachorros_section_id, 'Camada Luna') 
    RETURNING subgroup_id INTO v_camada_luna_subgroup_id;

    -- 3.3. Sección Manada (7-11 años)
    INSERT INTO public.section (tenant_id, group_id, name, description)
    VALUES (v_tenant_id, v_group_id, 'Manada', 'Edades de 7 a 11 años')
    RETURNING section_id INTO v_manada_section_id;
    
    -- Subgrupos de Manada
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_manada_section_id, 'Seisena Amarilla') 
    RETURNING subgroup_id INTO v_seisena_amarilla_subgroup_id;
    
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_manada_section_id, 'Seisena Verde') 
    RETURNING subgroup_id INTO v_seisena_verde_subgroup_id;

    -- 3.4. Sección Webelos (11-13 años)
    INSERT INTO public.section (tenant_id, group_id, name, description)
    VALUES (v_tenant_id, v_group_id, 'Webelos', 'Edades de 11 a 13 años')
    RETURNING section_id INTO v_webelos_section_id;

    -- Subgrupos de Webelos
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_webelos_section_id, 'Patrulla Tigres') 
    RETURNING subgroup_id INTO v_patrulla_tigres_subgroup_id;
    
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_webelos_section_id, 'Patrulla Panteras') 
    RETURNING subgroup_id INTO v_patrulla_panteras_subgroup_id;

    -- 3.5. Sección Tropa (14-17 años)
    INSERT INTO public.section (tenant_id, group_id, name, description)
    VALUES (v_tenant_id, v_group_id, 'Tropa', 'Edades de 14 a 17 años')
    RETURNING section_id INTO v_tropa_section_id;

    -- Subgrupos de Tropa
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_tropa_section_id, 'Patrulla Águilas') 
    RETURNING subgroup_id INTO v_patrulla_aguilas_subgroup_id;
    
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_tropa_section_id, 'Patrulla Lobos') 
    RETURNING subgroup_id INTO v_patrulla_lobos_subgroup_id;

    -- 3.6. Sección Clan (18-21 años)
    INSERT INTO public.section (tenant_id, group_id, name, description)
    VALUES (v_tenant_id, v_group_id, 'Clan', 'Edades de 18 a 21 años')
    RETURNING section_id INTO v_clan_section_id;
    
    -- Subgrupos de Clan
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_clan_section_id, 'Clan Alfa') 
    RETURNING subgroup_id INTO v_clan_alfa_subgroup_id;
    
    INSERT INTO public.subgroup (tenant_id, group_id, section_id, name) 
    VALUES (v_tenant_id, v_group_id, v_clan_section_id, 'Clan Beta') 
    RETURNING subgroup_id INTO v_clan_beta_subgroup_id;

    -- 4. Insertar todos los Miembros
    -- Using TEXT for tenant_id and user_id
    INSERT INTO public.member (tenant_id, subgroup_id, user_id, first_name, last_name, role, identification)
    VALUES
        -- Staff General (Roles Directivos, Administrativos y Técnicos)
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'María Fernanda', 'Torres', 'Fiscal de Grupo', '100001'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Andrés', 'Pérez', 'Corte de Honor de Grupo', '100002'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Laura', 'Castaño', 'Corte de Honor de Grupo', '100003'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Diego', 'Muñoz', 'Corte de Honor de Grupo', '100004'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Carlos', 'Ramírez', 'Presidente Scout de Grupo', '100005'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Paola', 'Jiménez', 'Vicepresidente', '100006'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Lucía', 'González', 'Secretaría', '100007'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Jorge', 'Herrera', 'Tesorería', '100008'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Natalia', 'Soto', 'Comisiones de Trabajo', '100009'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Felipe', 'Ruiz', 'Comisiones de Trabajo', '100010'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Alejandra', 'Vargas', 'Casa Scout de Grupo', '100011'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Daniela', 'Montoya', 'Almacén Scout (Rincón Scout)', '100012'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Juan Camilo', 'Restrepo', 'Jefe Scout Provincial', '100013'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Sara', 'Colmenares', 'Jefe Scout de Grupo', '100014'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'David', 'Ospina', 'Subjefe Scout de Grupo', '100015'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Lina', 'Morales', 'Raksha – Scouter', '100016'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Diana', 'Cardona', 'Akela – Scouter', '100017'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Jorge', 'Cárdenas', 'Jefe de Aldea – Scouter', '100018'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Nicolás', 'Ramírez', 'Jefe de Tropa – Scouter', '100019'),
        (v_tenant_id, v_staff_subgroup_id, gen_random_uuid()::TEXT, 'Alejandra', 'Jiménez', 'Jefe de Clan – Scouter', '100020'),

        -- Cachorros - Camada Sol
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Mateo', 'López', 'Miembro', '200001'),
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Valentina', 'Ríos', 'Miembro', '200002'),
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Samuel', 'Gómez', 'Miembro', '200003'),
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Isabella', 'Torres', 'Miembro', '200004'),
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Martín', 'Herrera', 'Miembro', '200005'),
        (v_tenant_id, v_camada_sol_subgroup_id, gen_random_uuid()::TEXT, 'Camila', 'Patiño', 'Miembro', '200006'),

        -- Cachorros - Camada Luna
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Tomás', 'Vargas', 'Miembro', '200007'),
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Sofía', 'Mendoza', 'Miembro', '200008'),
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Sebastián', 'Cruz', 'Miembro', '200009'),
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Mariana', 'Castro', 'Miembro', '200010'),
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Gabriel', 'Ruiz', 'Miembro', '200011'),
        (v_tenant_id, v_camada_luna_subgroup_id, gen_random_uuid()::TEXT, 'Ana María', 'Restrepo', 'Miembro', '200012'),

        -- Manada - Seisena Amarilla
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Andrés', 'López', 'Miembro', '300001'),
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Laura', 'Ruiz', 'Miembro', '300002'),
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Camilo', 'González', 'Miembro', '300003'),
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Juliana', 'Pérez', 'Miembro', '300004'),
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Esteban', 'Torres', 'Miembro', '300005'),
        (v_tenant_id, v_seisena_amarilla_subgroup_id, gen_random_uuid()::TEXT, 'Sara', 'Gómez', 'Miembro', '300006'),

        -- Manada - Seisena Verde
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Felipe', 'Ríos', 'Miembro', '300007'),
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Valeria', 'Castro', 'Miembro', '300008'),
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Juan David', 'Moreno', 'Miembro', '300009'),
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Natalia', 'López', 'Miembro', '300010'),
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Santiago', 'Pérez', 'Miembro', '300011'),
        (v_tenant_id, v_seisena_verde_subgroup_id, gen_random_uuid()::TEXT, 'Paula', 'García', 'Miembro', '300012'),

        -- Webelos - Patrulla Tigres
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Juan Esteban', 'Rodríguez', 'Miembro', '400001'),
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Daniela', 'Torres', 'Miembro', '400002'),
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Carlos', 'Ramírez Jr.', 'Miembro', '400003'),
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Mónica', 'López', 'Miembro', '400004'),
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Santiago', 'Vargas', 'Miembro', '400005'),
        (v_tenant_id, v_patrulla_tigres_subgroup_id, gen_random_uuid()::TEXT, 'Valentina', 'Jiménez', 'Miembro', '400006'),

        -- Webelos - Patrulla Panteras
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'José David', 'Ocampo', 'Miembro', '400007'),
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'Carolina', 'Ruiz', 'Miembro', '400008'),
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'Felipe', 'Castaño', 'Miembro', '400009'),
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'Isabella', 'Ramírez', 'Miembro', '400010'),
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'Andrés', 'Montoya', 'Miembro', '400011'),
        (v_tenant_id, v_patrulla_panteras_subgroup_id, gen_random_uuid()::TEXT, 'Sara', 'López', 'Miembro', '400012'),

        -- Tropa - Patrulla Águilas
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Diego', 'Torres', 'Miembro', '500001'),
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Mariana', 'Castaño', 'Miembro', '500002'),
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Camilo', 'Restrepo', 'Miembro', '500003'),
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Laura', 'Ospina', 'Miembro', '500004'),
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Felipe', 'Sánchez', 'Miembro', '500005'),
        (v_tenant_id, v_patrulla_aguilas_subgroup_id, gen_random_uuid()::TEXT, 'Daniel', 'Ríos', 'Miembro', '500006'),

        -- Tropa - Patrulla Lobos
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'Andrés', 'Cárdenas', 'Miembro', '500007'),
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'Valeria', 'Muñoz', 'Miembro', '500008'),
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'Juan Pablo', 'Herrera', 'Miembro', '500009'),
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'María Fernanda', 'López', 'Miembro', '500010'),
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'Santiago', 'Castro', 'Miembro', '500011'),
        (v_tenant_id, v_patrulla_lobos_subgroup_id, gen_random_uuid()::TEXT, 'Catalina', 'Gómez', 'Miembro', '500012'),

        -- Clan - Clan Alfa
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Mateo', 'Rodríguez', 'Miembro', '600001'),
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Laura', 'Vargas', 'Miembro', '600002'),
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Andrés', 'Torres', 'Miembro', '600003'),
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Camila', 'Mendoza', 'Miembro', '600004'),
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Felipe', 'López', 'Miembro', '600005'),
        (v_tenant_id, v_clan_alfa_subgroup_id, gen_random_uuid()::TEXT, 'Sofía', 'Ríos', 'Miembro', '600006'),

        -- Clan - Clan Beta
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Daniel', 'Ramírez', 'Miembro', '600007'),
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Valentina', 'Herrera', 'Miembro', '600008'),
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Carlos', 'Ospina', 'Miembro', '600009'),
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Natalia', 'Gómez', 'Miembro', '600010'),
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Juan Sebastián', 'Pérez', 'Miembro', '600011'),
        (v_tenant_id, v_clan_beta_subgroup_id, gen_random_uuid()::TEXT, 'Mariana', 'Torres', 'Miembro', '600012');
END $$;

-- Confirma la transacción.
COMMIT;
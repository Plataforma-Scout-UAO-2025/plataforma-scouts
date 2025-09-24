create table if not exists "Miembro" (
    id_miembro integer primary key,
    identificacion bigint not null,
    tipoDocumento text not null,
    nombres text not null,
    apellidos text not null,
    correo text,
    sexo text,
    fechaNacimiento text,
    ciudad text,
    direccion text,
    telefono bigint,
    institucion text,
    curso text,
    calendarioEscolar text,
    jornadaEscolar text,
    peso double precision,
    estatura double precision,
    tipoSangre text,
    factorRh text,
    pasatiempos text,
    deportes text,
    instrumentos text,
    estado text check (estado in ('ACTIVO','INACTIVO','SUSPENDIDO')), -- según tu Enum
    fechaAceptacion date
);

CREATE TABLE grupo ( grupo_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, tenant_slug VARCHAR(40) NOT NULL UNIQUE,
    -- Ej: "grupo-scout-1", "grupo-scout-2" -- Datos básicos 
    nombre VARCHAR(150) NOT NULL, 
    distrito VARCHAR(100) NOT NULL, 
    numero_identificador VARCHAR(50) UNIQUE, -- Ej: "803", "113" 
    region VARCHAR(100) NOT NULL, 
    direccion TEXT, 
    telefono_contacto VARCHAR(20), 
    email_contacto VARCHAR(150), -- Información institucional
    fecha_fundacion DATE, 
    lema VARCHAR(255), 
    mision TEXT, 
    vision TEXT, 
    historia TEXT, -- Branding y configuración
    logo_url TEXT, 
    configuracion JSONB DEFAULT '{}'::jsonb, redes_sociales JSONB DEFAULT '{}'::jsonb, -- Control 
    esta_activo BOOLEAN DEFAULT TRUE, fecha_creacion TIMESTAMP DEFAULT now(), fecha_actualizacion TIMESTAMP DEFAULT now() ); 

CREATE TABLE tenant ( tenant_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, grupo_id INT NOT NULL UNIQUE REFERENCES grupo(grupo_id) ON DELETE CASCADE, 
    estado BOOLEAN DEFAULT TRUE, 
    fecha_creacion TIMESTAMP DEFAULT now(), 
    fecha_actualizacion TIMESTAMP DEFAULT now() );

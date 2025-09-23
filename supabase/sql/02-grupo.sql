CREATE TABLE grupo (
    grupo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(tenant_id) ON DELETE CASCADE,
    
    tenant_slug VARCHAR(40) NOT NULL UNIQUE, -- Ej: "grupo-scout-1", "grupo-scout-2"

    -- Datos básicos
    nombre VARCHAR(150) NOT NULL,
    numero_identificador VARCHAR(50) UNIQUE,  -- Ej: "803", "113"
    region VARCHAR(100) NOT NULL,             -- Guardado directo para evitar JOIN
    direccion TEXT,
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(150),

    -- Información institucional
    fecha_fundacion DATE,
    lema VARCHAR(255),
    mision TEXT,
    vision TEXT,
    historia TEXT,

    -- Branding y configuración
    logo_url TEXT,
    configuracion JSONB DEFAULT '{}'::jsonb,  -- colores, reglas, validaciones que se vea en la app, etc.
    redes_sociales JSONB DEFAULT '{}'::jsonb, -- {"facebook": "...", "instagram": "..."}

    -- Control
    esta_activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_actualizacion TIMESTAMP DEFAULT now()
);

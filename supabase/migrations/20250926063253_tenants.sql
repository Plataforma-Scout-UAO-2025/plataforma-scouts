CREATE TABLE tenant (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- identificador único del tenant
    estado BOOLEAN DEFAULT TRUE,                          -- activo/inactivo
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_actualizacion TIMESTAMP DEFAULT now()
);

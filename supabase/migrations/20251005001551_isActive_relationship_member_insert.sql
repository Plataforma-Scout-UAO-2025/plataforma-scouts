-- Add is_active and relationship columns to member table

-- Backend solicita estos cambios:
-- 1. Añadir columna is_active (boolean, sin valor por defecto)
-- 2. Añadir columna relationship (text, nullable)

-- Add is_active column (boolean, nullable, no default)
ALTER TABLE member 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- Add relationship column (text, nullable)
ALTER TABLE member 
ADD COLUMN IF NOT EXISTS relationship TEXT;
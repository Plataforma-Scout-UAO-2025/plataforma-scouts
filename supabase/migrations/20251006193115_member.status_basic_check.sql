-- Agregar restricción CHECK para asegurar solo valores de estado válidos
ALTER TABLE member 
ADD CONSTRAINT chk_member_status 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_member_status ON member(status);
-- Migration: Add is_test column to tenant table

BEGIN; 

ALTER TABLE tenant ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;

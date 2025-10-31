-- Adds acceptTreatment column to member table, as a boolean with default false because users must explicitly accept treatment terms.

ALTER TABLE member
ADD COLUMN accept_treatment BOOLEAN NOT NULL DEFAULT FALSE;
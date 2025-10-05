-- =======================
-- ACCOUNT  (1 por SCOUT en el tenant)
-- =======================
CREATE TABLE account (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id  TEXT NOT NULL,
  member_id  BIGINT NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'COP',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_account_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT fk_account_member FOREIGN KEY (member_id) REFERENCES member(member_id),
  CONSTRAINT uq_account_member_per_tenant UNIQUE (tenant_id, member_id)
);

CREATE INDEX ix_account_tenant ON account (tenant_id);
CREATE INDEX ix_account_member ON account (member_id);
CREATE INDEX ix_account_member_active ON account (member_id, active);

-- =======================
-- CONCEPT 
-- =======================
CREATE TABLE concept (
  concept_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  description TEXT NOT NULL,
  name        TEXT NOT NULL,
  CONSTRAINT fk_concept_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id)
);

CREATE UNIQUE INDEX uq_concept_name_ci_per_tenant ON concept (tenant_id, lower(name));
CREATE INDEX ix_concept_tenant ON concept (tenant_id);

-- =======================
-- FEE_PLAN 
-- =======================
CREATE TABLE fee_plan (
  fee_plan_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  concept_id    BIGINT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  periodicity   TEXT NOT NULL CHECK (periodicity IN ('SINGLE','MONTH','QUARTER','YEAR')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  proratable    BOOLEAN NOT NULL DEFAULT FALSE,
  scope         TEXT NOT NULL CHECK (scope IN ('ALL','SCOUT','SUBGROUP','SECTION')),
  associated_to JSONB NULL,
  
  CONSTRAINT fk_fee_plan_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT fk_fee_plan_concept FOREIGN KEY (concept_id) REFERENCES concept(concept_id),
  
  -- Reglas de coherencia de fechas
  CONSTRAINT fee_plan_dates_chk CHECK (start_date <= end_date),
  
  -- Regla para associated_to:
  -- - ALL      => associated_to debe ser NULL
  -- - SCOUT/*  => associated_to debe tener al menos {"id":..., "name":...}
  CONSTRAINT fee_plan_associated_to_chk CHECK (
    (scope = 'ALL' AND associated_to IS NULL)
    OR (
      scope IN ('SCOUT','SUBGROUP','SECTION')
      AND associated_to IS NOT NULL
      AND jsonb_typeof(associated_to) = 'object'
      AND (associated_to ? 'id')
      AND (associated_to ? 'name')
      AND (associated_to->>'id')   IS NOT NULL
      AND (associated_to->>'name') IS NOT NULL
    )
  )
);

CREATE INDEX ix_fee_plan_tenant ON fee_plan (tenant_id);
CREATE INDEX ix_fee_plan_concept ON fee_plan (concept_id);
CREATE INDEX ix_fee_plan_scope ON fee_plan (scope);
CREATE INDEX ix_fee_plan_dates ON fee_plan (start_date, end_date);
CREATE INDEX ix_fee_plan_tenant_concept ON fee_plan (tenant_id, concept_id);

-- =======================
-- INSTALLMENT
-- =======================
CREATE TABLE installment (
  installment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  account_id     BIGINT NOT NULL,
  concept_id     BIGINT NOT NULL,
  due_date       DATE NOT NULL,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status         TEXT NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','PARTIAL','PAID','OVERDUE')),
  balance        NUMERIC(12,2) NOT NULL,
  payments       JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  CONSTRAINT fk_installment_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT fk_installment_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
  CONSTRAINT fk_installment_concept FOREIGN KEY (concept_id) REFERENCES concept(concept_id),
  CONSTRAINT uq_installment_per_account_concept_date UNIQUE (tenant_id, account_id, concept_id, due_date)
);

CREATE INDEX ix_installment_tenant ON installment (tenant_id);
CREATE INDEX ix_installment_account ON installment (account_id);
CREATE INDEX ix_installment_concept ON installment (concept_id);
CREATE INDEX ix_installment_due_date ON installment (due_date);
CREATE INDEX ix_installment_status ON installment (status);
CREATE INDEX ix_installment_tenant_concept ON installment (tenant_id, concept_id);
CREATE INDEX ix_installment_tenant_account ON installment (tenant_id, account_id);

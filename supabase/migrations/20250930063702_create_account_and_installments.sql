-- =======================
-- ACCOUNT  (1 por SCOUT en el tenant)
-- =======================
CREATE TABLE account (
  account_id bigserial PRIMARY KEY,
  tenant_id  text NOT NULL,
  member_id  bigint NOT NULL,
  currency   text   NOT NULL DEFAULT 'COP',
  created_at timestamp NOT NULL DEFAULT now(),
  active     boolean   NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_account_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT fk_account_member FOREIGN KEY (member_id) REFERENCES member(member_id),
  CONSTRAINT uq_account_member_per_tenant UNIQUE (tenant_id, member_id)
);

-- =======================
-- CONCEPT 
-- =======================
CREATE TABLE concept (
  concept_id  bigserial PRIMARY KEY,
  tenant_id   text NOT NULL,
  name        text   NOT NULL,
  CONSTRAINT fk_concept_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id)
);

-- =======================
-- FEE_PLAN 
-- =======================
CREATE TABLE fee_plan (
  fee_plan_id      bigserial PRIMARY KEY,
  tenant_id        text NOT NULL,
  concept_id       bigint NOT NULL REFERENCES concept(concept_id),
  amount           numeric(12,2) NOT NULL CHECK (amount >= 0),
  periodicity      text   NOT NULL CHECK (periodicity IN ('SINGLE','MONTH','QUARTER','YEAR')),
  start_date       date   NOT NULL,
  end_date         date,
  proratable       boolean NOT NULL DEFAULT FALSE,
  scope            text   NOT NULL CHECK (scope IN ('ALL','SCOUT','SUBGROUP','SECTION')),
  target_member_id bigint NULL REFERENCES member(member_id),
  CONSTRAINT fk_fee_plan_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  -- Cuando scope='SCOUT' se exige target_member_id; en otros casos debe ser NULL
  CONSTRAINT fee_plan_scope_matrix CHECK (
    (scope = 'SCOUT' AND target_member_id IS NOT NULL)
    OR (scope IN ('ALL','SUBGROUP','SECTION') AND target_member_id IS NULL)
  )
);

-- =======================
-- INSTALLMENT
-- =======================
CREATE TABLE installment (
  installment_id bigserial PRIMARY KEY,
  tenant_id      text NOT NULL,
  account_id     bigint NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  concept_id     bigint NOT NULL REFERENCES concept(concept_id),
  due_date       date   NOT NULL,
  amount         numeric(12,2) NOT NULL CHECK (amount >= 0),
  status         text   NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','PARTIAL','PAID','OVERDUE')),
  balance        numeric(12,2) NOT NULL,
  payments       jsonb  NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT fk_installment_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT uq_installment_per_account_concept_date
    UNIQUE (tenant_id, account_id, concept_id, due_date)
);

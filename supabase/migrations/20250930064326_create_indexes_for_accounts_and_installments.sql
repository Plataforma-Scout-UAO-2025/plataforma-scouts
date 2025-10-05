-- Additional specialized indexes for accounts and installments
-- Note: Basic indexes are already created in the main DDL migration

-- ACCOUNT
-- Composite index for tenant + member queries (already have individual indexes)
CREATE INDEX IF NOT EXISTS idx_account_tenant_member ON account(tenant_id, member_id);

-- FEE_PLAN
-- Specialized indexes for SCOUT scope queries with associated_to
CREATE INDEX IF NOT EXISTS idx_fp_scope_associated 
  ON fee_plan(scope, (associated_to->>'id'))
  WHERE scope = 'SCOUT';

CREATE INDEX IF NOT EXISTS idx_fp_associated_dates
  ON fee_plan((associated_to->>'id'), start_date, end_date)
  WHERE scope IN ('SCOUT','SUBGROUP','SECTION');

-- INSTALLMENT
-- Composite index for account + due_date queries
CREATE INDEX IF NOT EXISTS idx_inst_account_duedate ON installment(account_id, due_date);

-- Partial index for active work (pending/overdue installments)
CREATE INDEX IF NOT EXISTS idx_inst_account_work
  ON installment(account_id, status, due_date)
  WHERE status IN ('PENDING','OVERDUE');

-- GIN index for JSONB payments search
CREATE INDEX IF NOT EXISTS idx_inst_payments_gin ON installment USING GIN (payments);

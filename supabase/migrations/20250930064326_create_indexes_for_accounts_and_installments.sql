-- ACCOUNT
CREATE INDEX IF NOT EXISTS idx_account_member
  ON account(member_id);

CREATE INDEX IF NOT EXISTS idx_account_tenant_member
  ON account(tenant_id, member_id);

CREATE INDEX IF NOT EXISTS idx_account_member_active
  ON account(member_id, active);

-- FEE_PLAN
CREATE INDEX IF NOT EXISTS idx_fp_scope_target
  ON fee_plan(scope, target_member_id)
  WHERE scope = 'SCOUT';

CREATE INDEX IF NOT EXISTS idx_fp_scope_target_dates
  ON fee_plan(target_member_id, start_date, end_date)
  WHERE scope = 'SCOUT';

CREATE INDEX IF NOT EXISTS idx_fp_concept
  ON fee_plan(concept_id);

-- INSTALLMENT
CREATE INDEX IF NOT EXISTS idx_inst_account_duedate
  ON installment(account_id, due_date);

CREATE INDEX IF NOT EXISTS idx_inst_account_work
  ON installment(account_id, status, due_date)
  WHERE status IN ('PENDING','OVERDUE');

CREATE INDEX IF NOT EXISTS idx_inst_concept
  ON installment(concept_id);

CREATE INDEX IF NOT EXISTS idx_inst_payments_gin
  ON installment USING GIN (payments);

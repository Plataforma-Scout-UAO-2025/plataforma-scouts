export interface ReportSection {
  id: number;
  name: string;
  members: number;
}

export interface ReportSummary {
  start_date: Date;
  end_date: Date;
  generated_date: Date;
}

export interface ReportPayments {
  payment_id: string;
  first_name: string;
  last_name: string;
  amount: number;
  paid_at: Date;
}

export interface ReportSummary {
  incomes: number;
  pending: number;
  overdue: number;
}

export interface FinancialReport {
  financial_summary: ReportSummary;
  members_ok: number;
  members_overdue: number;
  percentage: number;
  payments: ReportPayments[];
}

export interface ReportPayments {
  payment_id: string;
  first_name: string;
  last_name: string;
  amount: number;
  paid_at: string | null;
}

export interface ReportSummary {
  income: number;
  pending: number;
  overdue: number;
}

export interface FinancialReport {
  financial_summary: ReportSummary;
  members_ok: number | null;
  members_overdue: number | null;
  percentage: number | null;
  payments: ReportPayments[];
  start_date: string;
  end_date: string;
  scope: string;
  metadata?: {
    generated_for: string;
    start_date: Date;
    end_date: Date;
    generated_date: Date;
  };
}

// Tipos para filtros de reporte
export interface FiltrosReporte {
  id: string;
  generated_for: "MEMBER" | "SUBGROUP" | "SECTION";
  start_date: string;
  end_date: string;
}

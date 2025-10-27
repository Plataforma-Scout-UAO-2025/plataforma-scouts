export interface ReportMetadata {
  generated_for: string; // Alcance: "scout", "seccion", "subgrupo"
  start_date: Date;
  end_date: Date;
  generated_date: Date;
}

export interface ReportPayments {
  payment_id: string;
  first_name: string;
  last_name: string;
  amount: number;
  paid_at: Date | null;
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
  metadata: ReportMetadata;
}

// Tipos para filtros de reporte
export interface FiltrosReporte {
  scope: "SCOUT" | "SUBGROUP" | "SECTION"; // Alcance del reporte
  associated_to?: {
    id: string;
    name: string;
  };
  fechaInicio: string;
  fechaFin: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  miembrosActivos: number;
}

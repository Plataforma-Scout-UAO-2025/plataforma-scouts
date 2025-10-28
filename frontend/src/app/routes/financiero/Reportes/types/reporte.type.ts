export type Grupo = {
  id: string;
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  miembrosActivos: number;
};

export type EstadoPago = "pagado" | "pendiente" | "vencido";

export type MiembroPago = {
  id: string;
  nombre: string;
  apellido: string;
  estado: EstadoPago;
  montoPagado: number;
  montoTotal: number;
  fechaUltimoPago?: string;
  diasVencido?: number;
};

export type ResumenFinanciero = {
  totalIngresos: number;
  totalPendiente: number;
  totalVencido: number;
  miembrosCumplidos: number;
  miembrosAtrasados: number;
  totalMiembros: number;
  porcentajeCumplimiento: number;
};

export type ReportePagos = {
  grupo: Grupo;
  fechaInicio: string;
  fechaFin: string;
  resumen: ResumenFinanciero;
  miembros: MiembroPago[];
  generadoEn: string;
};

export type FiltrosReporte = {
  grupoId: string;
  fechaInicio: string;
  fechaFin: string;
};

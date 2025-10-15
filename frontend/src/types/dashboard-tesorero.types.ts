import type { InstallmentPayment } from "./pago.type";

export interface MiembroMora {
  member_id: number;
  first_name: string;
  last_name: string;
  subgroup_name: string;
  amount_debt: number;
}

export interface DashboardFinanciero {
  kpis: {
    total_recaudado: number;
    total_pendiente: number;
    pagos_vencidos: number;
  };
  porcentaje_cumplimiento: {
    nombre: string;
    porcentaje: number;
  }[];
  ultimos_pagos: InstallmentPayment[];
  miembros_mora: MiembroMora[];
  distribucion_pagos: {
    porcentaje_pagado: number;
    porcentaje_pendiente: number;
    porcentaje_vencido: number;
  };
}
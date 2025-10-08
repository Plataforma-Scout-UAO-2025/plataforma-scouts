import type { PaymentStatus } from "./pago.type";

// Caso 1: Cuando es el acudiente el que consulta el estado de cuenta
export interface EstadoCuenta {
  kpis: {
    totalPendiente: number;
    totalPagado: number;
    cuotasVencidas: number;
  };
  cuotas: CuotasEstado[];
  // Caso 2: Cuando es el tesorero el que consulta el estado de cuenta members viene null
  members: Member[] | null;
}

export interface CuotasEstado {
  installment_id: string;
  name: string;
  ammount: number;
  due_date: Date;
  status: PaymentStatus;
  paid_at: Date | null;
  method: string | null;
  reference: string | null;
  payment_id: string | null;
  member_name: string;
}

export interface Member {
  member_id: string;
  member_name: string;
  age: number;
  subgroup: {
    subgroup_id: string;
    name: string;
  };
  section: {
    section_id: string;
    name: string;
  };
}

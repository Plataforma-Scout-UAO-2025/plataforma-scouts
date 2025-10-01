import type { MemberPaymentDto } from "./pago.type";

export type Periodicity = "SINGLE" | "MONTH" | "QUARTER" | "YEAR";
export type Scope = "ALL" | "SCOUT" | "SUBGROUP" | "SECTION";

export interface CreateCuotaDto {
  name: string;
  description: string;
  amount: number;
  periodicity: Periodicity;
  scope: Scope;
  start_date: Date;
  end_date?: Date;
  // Solo cuando el scope es SCOUT
  target_member_id?: number;
}

// Editar y ver cuota
export type Cuota = {
  fee_plan_id: string;
  amount: number;
  name: string
  description: string;
  periodicity: Periodicity;
  scope: Scope;
  start_date: Date;
  end_date?: Date;
  member: MemberPaymentDto;
};

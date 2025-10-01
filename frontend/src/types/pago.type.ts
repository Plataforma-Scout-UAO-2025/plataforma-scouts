export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

// Para crear el pago
export interface CreatePagoDto  {
  payment_id: string; // M Autogenerado
  amount: number;  // M
  paid_at?: number; // M Opcional
  method: string; // M
  reference: string; // M
  payer_member_id: number // M
};

// Para ver el pago
export interface PagoDto {
  payment_id: string;
  name: string;
  description: string;
  due_date: Date;
  amount: number;
  method: string;
  status: PaymentStatus;
  balance: number;
  member: MemberPaymentDto;
}

export interface MemberPaymentDto {
  member_id: number;
  tenant_id: number;
  first_name: string;
  last_name: string;
  subgroup: string;
  age: number;
}

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

export interface SubgroupPayment {
  subgroup_id: string;
  subgroup_name: string;
}

export interface SectionPayment {
  section_id: string;
  section_name: string;
}

export interface InstallmentPayment {
  installment_id: string;
  name: string;
  due_date: Date;
  amount: number;
  status: PaymentStatus;
  // Auto generado en el frontend con crypto.randomUUID()
  payment_id: string | null;
  paid_at: Date | null;
  method: string | null;
  reference: string | null;
  payer_member_id: string | null;
}

export interface PaymentRecord {
  member_id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  subgroup: SubgroupPayment;
  section: SectionPayment;
  installment: InstallmentPayment[];
}

export interface CreatePaymentDto {
  paid_at: string;
  method: string;
  reference: string;
}
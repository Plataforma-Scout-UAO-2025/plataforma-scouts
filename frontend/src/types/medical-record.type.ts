import type { MedicalFormData } from "./medical-form.type";

export interface MedicalRecord extends MedicalFormData {
  id: number;
  created_at: string;
  updated_at: string;
  member_name: string;
}

export interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}
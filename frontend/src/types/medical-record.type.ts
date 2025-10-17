import type { MedicalDB } from "./medical-form.type";

export interface MedicalRecord extends MedicalDB {
  member_name: string;
}

export interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}
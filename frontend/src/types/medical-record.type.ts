import type { MedicalDB } from "./medical-form.type";

export interface MedicalRecord extends MedicalDB {
  member_name: string;
}

export interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  isLoading?: boolean;
}

export type SortColumn = 'member_name' | 'blood_type' | 'eps' | 'allergies' | 'vaccines' | 'medications' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
export interface VaccineDetail {
  name: string;
  applied_at: string;
}

export interface MedicationDetail {
  name: string;
  dose: string;
  frequency: string;
}

export interface MedicalDB extends MedicalFormData {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface MedicalFormData extends MedicalApi {
  member_id: number;
  active: boolean;
}

export interface MedicalApi {
  blood_type: string;
  eps: string;
  allergies: string;
  chronic_diseases: string;
  physical_restrictions: string;
  surgical_history: string;
  vaccines_detail: VaccineDetail[];
  medications_detail: MedicationDetail[];
}

export interface MedicalFormErrors {
  [key: string]: string | null;
}

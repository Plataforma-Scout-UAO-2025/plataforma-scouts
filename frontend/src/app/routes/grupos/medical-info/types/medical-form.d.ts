export interface VaccineDetail {
  name: string;
  date: string;
}

export interface MedicationDetail {
  name: string;
  dose: string;
  frecuency: string;
}

export interface MedicalFormData {
  member_id: number;
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


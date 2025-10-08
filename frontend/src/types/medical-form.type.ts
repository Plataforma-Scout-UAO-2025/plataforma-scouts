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

export interface ApiMember {
  memberId: number;
  firstName: string;
  lastName: string;
  identification: string;
  role: string;
  status: string;
  isActive: boolean;
}

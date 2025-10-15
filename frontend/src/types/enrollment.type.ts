import type { EmergencyContact, Member } from "./member.type";

export type DocumentType =
  | "CC"
  | "TI"
  | "CE"
  | "RC"
  | "PA"
  | "PEP"
  | "PPT"
  | "NIT"
  | "NUIP"
  | "";
export type Gender = "Femenino" | "Masculino" | "";
export type Shift = "Mañana" | "Tarde" | "Noche" | "Completa" | "";

export interface PersonalData {
  firstname: string;
  lastname: string;
  email: string;
  confirm_email: string;
  document_type: DocumentType;
  identification: string;
  birth_date: string;
  address: string;
  phone: string;
  gender: Gender;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  tenantId: string;
  emergency_contacts: EmergencyContact[];
}

export interface SchoolData {
  institution: string;
  course: string;
  calendar: string;
  shift: Shift;
}

export interface CreateMemberWithSchoolRequest {
  member: Member;
  school: SchoolData;
}

export type ChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement
>;

export type EmergencyContactField = keyof EmergencyContact;

export interface EnrollmentFormState {
  personalData: PersonalData;
  schoolData: SchoolData;
  currentPage: number;
  includeSchoolData: boolean;
  isLoading: boolean;
  showSuccessModal: boolean;
  showSchoolDialog: boolean;
}

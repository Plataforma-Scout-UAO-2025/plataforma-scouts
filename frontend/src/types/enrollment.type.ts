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
export type role =
  | "SCOUT"
  | "ACUDIENTE"
  | "TESORERO"
  | "SCOUTER"
  | "COMITE_ADMIN"
  | "DEV_SUPPORT"
  | "ADMIN_GLOBAL"
  | "ADMIN_GRUPO";

export interface PersonalData {
  firstname: string;
  lastname: string;
  email: string;
  confirm_email: string;
  username: string;
  password: string;
  confirm_password: string;
  document_type: DocumentType;
  identification: string;
  birth_date: string;
  role: role;
  address: string;
  phone: string;
  gender: Gender;
  weight: string;
  height: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  tenantId: string;
  emergency_contacts?: EmergencyContact[];
  data_treatment_consent?: string;
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

export interface CreateAuth0Request {
  email: string;
  password: string;
  username: string;
  role?: role;
}

export interface CreateAuth0Response {
  message: string;
  userId: string;
  email: string;
  username: string;
  role: string;
}

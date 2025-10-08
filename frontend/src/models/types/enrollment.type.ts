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
export type GroupName = "Centinelas 113" | "803 Chiminigagua" | "";
export type MemberStatus = "PENDING" | "ACCEPTED" | "NOT_ACCEPTED";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

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
  group: GroupName;
  emergency_contacts: EmergencyContact[];
}

export interface SchoolData {
  institution: string;
  course: string;
  calendar: string;
  shift: Shift;
}

export interface CreateMemberRequest {
  tenantId: string;
  subgroup: {
    subgroupId: number;
  };
  firstName: string;
  lastName: string;
  age: number;
  role: string;
  identification: string;
  documentType: string;
  email: string;
  gender: string;
  birthDate: string | Date;
  address: string;
  phone: string;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  isActive: boolean;
  status: string;
  emergencyContacts: EmergencyContact[];
}

export interface CreateMemberResponse {
  member_id: number;
}

export interface CreateMemberWithSchoolRequest {
  member: CreateMemberRequest;
  school: SchoolData;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}

export type ChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement
>;

export type EmergencyContactField = keyof EmergencyContact;

export interface GroupMapping {
  [key: string]: string;
}

export const GROUP_TO_SUBGROUP_ID: GroupMapping = {
  "Centinelas 113": "1",
  "803 Chiminigagua": "2",
};

export interface EnrollmentFormState {
  personalData: PersonalData;
  schoolData: SchoolData;
  currentPage: number;
  includeSchoolData: boolean;
  isLoading: boolean;
  showSuccessModal: boolean;
  showSchoolDialog: boolean;
}

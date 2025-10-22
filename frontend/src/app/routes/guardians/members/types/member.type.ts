export interface EmergencyContact {
  id?: number;
  fullName: string;
  relationship: 'Padre' | 'Madre' | 'Tutor' | 'Abuelo/a' | 'Tío/a' | 'Hermano/a' | 'Otro';
  phone: string;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  documentType: 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'NIT' | 'NUIP';
  identification: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  phone: string;
  address: string;
  role?: string;
  acceptanceDate: string;
  isActive: boolean;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  emergencyContacts: EmergencyContact[];
  createdAt: string;
  city: string;
  rama: string;
  age?: number;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  documentType: 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'NIT' | 'NUIP';
  identification: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  phone: string;
  address: string;
  role?: string;
  acceptanceDate: string;
  isActive: boolean;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  emergencyContacts: EmergencyContact[];
}
import type { Section } from "./section.type";

export interface Member {
  memberId?: number;
  firstName?: string;
  lastName?: string;
  subgroupId?: number;
  subgroupName?: string;
  sectionId?: number;
  sectionName?: string;
  age?: number;
  userId?: string;
  tenantId?: string;
  guardianId?: number;
  relationship?: string;
  role?: "admin_group" | "admin_global" | "scout";
  status?: string;
  isActive?: boolean;
  identification?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptanceDate?: Date;
  emergencyContacts?: EmergencyContact[];
  createdAt?: string;
  updatedAt?: string;
  branch?: Section[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

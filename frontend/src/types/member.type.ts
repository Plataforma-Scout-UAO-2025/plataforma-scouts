import type { Section } from "./section.type";
import type { role } from "./enrollment.type";
import type { SchoolData } from "./enrollment.type";

export interface Member {
  // Campos opcionales para manejar ambas convenciones de nombres
  // (camelCase y snake_case)
  tenantId?: string;
  memberId?: number | 0;
  sectionId?: number;
  sectionName?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  createdAt?: string;
  
  member_id?: number;
  first_name?: string;
  last_name?: string;
  subgroup_id?: number | 0;
  subgroup_name?: string;
  section_id?: number | 0;
  section_name?: string;
  age?: number;
  user_id?: string;
  tenant_id?: string;
  guardian_id?: number;
  relationship?: string;
  role?: role;
  status?: string;
  is_active?: boolean;
  identification?: string;
  document_type?: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birth_date?: string | Date;
  birthDate?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptance_date?: string;
  emergency_contacts?: EmergencyContact[];
  emergencyContacts?: EmergencyContact[];
  created_at?: string;
  updated_at?: string;
  subgroup?: {
    name?: string;
    description?: string | null;
    subgroupId?: number;
    tenantId?: string;
    groupId?: number;
    sectionId?: number;
    photoPrincipal?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Variante snake_case
    subgroup_id?: number;
    tenant_id?: string;
    group_id?: number;
    section_id?: number;
    photo_principal?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    branch?: string;
    // Se incluye `section` anidado como objeto que también puede venir en camelCase o snake_case
    section?: {
      name?: string;
      description?: string | null;
      sectionId?: number;
      tenantId?: string;
      groupId?: number;
      iconObjectId?: string | null;
      photoPrincipal?: string | null;
      galleryObjectIds?: string[];
      createdAt?: string;
      updatedAt?: string;

      // snake_case
      section_id?: number;
      tenant_id?: string;
      group_id?: number;
      icon_object_id?: string | null;
      photo_principal?: string | null;
      gallery_object_ids?: string[];
      created_at?: string;
      updated_at?: string;
    };
  };
  branch?: Section[];
  schoolData?: SchoolData;
  }

export interface CreateMember {
  tenantId?: string;
  memberId?: number | 0;
  subgroupId?: number | 0;
  subgroupName?: string;
  sectionId?: number | 0;
  sectionName?: string;
  firstName?: string;
  lastName?: string;
  documentType?: string;
  birthDate?: Date;
  isActive?: boolean;
  emergencyContacts?: EmergencyContact[];
  
  member_id?: number;
  first_name?: string;
  last_name?: string;
  subgroup_id?: number;
  subgroup_name?: string;
  section_id?: number;
  section_name?: string;
  age?: number;
  user_id?: string;
  tenant_id?: string;
  guardian_id?: number;
  relationship?: string;
  role?: role;
  status?: string;
  is_active?: boolean;
  identification?: string;
  document_type?: string;
  email?: string;
  gender?: string;
  birth_date?: string | Date;
  address?: string;
  phone?: string;
  weight?: string;
  height?: string;
  hobbies?: string;
  sports?: string;
  instruments?: string;
  acceptance_date?: string;
  emergency_contacts?: EmergencyContact[];
  created_at?: string;
  updated_at?: string;
  branch?: Section[];
}

export interface UpdateMember {
  memberId?: number;
  member_id?: number;
  firstName?: string;
  lastName?: string;
  subgroupId?: number;
  subgroupName?: string;
  age?: number;
  userId?: string;
  tenantId?: string;
  guardianId?: number;
  guardian_id?: number;
  relationship?: string;
  role?: role;
  status?: string;
  isActive?: boolean;
  is_active?: boolean;
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
  emergency_contacts?: EmergencyContact[];
  createdAt?: string;
  updatedAt?: string;
  branch?: Section[];
  subgroup?: {
    name?: string;
    description?: string | null;
    subgroupId?: number;
    tenantId?: string;
    groupId?: number;
    sectionId?: number;
    photoPrincipal?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Variante snake_case
    subgroup_id?: number;
    tenant_id?: string;
    group_id?: number;
    section_id?: number;
    photo_principal?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    branch?: string;
    // Se incluye `section` anidado como objeto que también puede venir en camelCase o snake_case
    section?: {
      name?: string;
      description?: string | null;
      sectionId?: number;
      tenantId?: string;
      groupId?: number;
      iconObjectId?: string | null;
      photoPrincipal?: string | null;
      galleryObjectIds?: string[];
      createdAt?: string;
      updatedAt?: string;

      // snake_case
      section_id?: number;
      tenant_id?: string;
      group_id?: number;
      icon_object_id?: string | null;
      photo_principal?: string | null;
      gallery_object_ids?: string[];
      created_at?: string;
      updated_at?: string;
    };
  };
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

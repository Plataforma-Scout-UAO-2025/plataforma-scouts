import type {
  PersonalData,
  CreateMemberRequest,
  EmergencyContact,
} from "@/models/types/enrollment.type";
import { GROUP_TO_SUBGROUP_ID } from "@/models/types/enrollment.type";

export const calcularEdad = (fecha: string): number => {
  if (!fecha) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

export const transformarDatos = (data: PersonalData): CreateMemberRequest => {
  const edad = calcularEdad(data.birth_date);

  const emergencyContacts: EmergencyContact[] = data.emergency_contacts
    .filter((contact) => contact.name && contact.phone)
    .map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
    }));

  return {
    tenantId: GROUP_TO_SUBGROUP_ID[data.group],
    firstName: data.firstname,
    lastName: data.lastname,
    age: edad,
    identification: data.identification,
    documentType: data.document_type,
    email: data.email,
    gender: data.gender,
    birthDate: new Date(data.birth_date),
    address: data.address,
    phone: data.phone,
    weight: data.weight,
    height: data.height,
    hobbies: data.hobbies,
    sports: data.sports,
    instruments: data.instruments,
    isActive: true,
    status: "PENDING",
    emergencyContacts,
    subgroup: {
      subgroupId: 12,
    },
    role: "SCOUT",
  };
};

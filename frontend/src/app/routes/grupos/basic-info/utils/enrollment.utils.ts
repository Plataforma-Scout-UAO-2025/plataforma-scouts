import type { PersonalData } from "@/types/enrollment.type";
import type { EmergencyContact, Member } from "@/types/member.type";

export const calculateAge = (fecha: string): number => {
  if (!fecha) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

export const transformData = (data: PersonalData): Member => {
  const edad = calculateAge(data.birth_date);

  const emergencyContacts: EmergencyContact[] = data.emergency_contacts
    .filter((contact) => contact.name && contact.phone)
    .map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
    }));

  return {
    tenantId: data.tenantId,
    firstName: data.firstname,
    lastName: data.lastname,
    age: edad,
    identification: data.identification,
    documentType: data.document_type,
    email: data.email,
    gender: data.gender,
    role: "scout",
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
  };
};
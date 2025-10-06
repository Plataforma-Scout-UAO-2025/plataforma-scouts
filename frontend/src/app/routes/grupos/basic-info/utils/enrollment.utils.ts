import type {
  PersonalData,
  CreateMemberRequest,
  EmergencyContact,
} from "../types/enrollment.type";
import { GROUP_TO_SUBGROUP_ID } from "../types/enrollment.type";

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

  const emergencyPhone: Record<string, EmergencyContact> = {};
  data.emergency_contacts.forEach((contact, index) => {
    if (contact.name && contact.phone) {
      emergencyPhone[`contact${index + 1}`] = {
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
      };
    }
  });

  return {
    subgroup_id: GROUP_TO_SUBGROUP_ID[data.group] || 1,
    first_name: data.firstname,
    last_name: data.lastname,
    age: edad,
    identification: Number(data.identification),
    document_type: data.document_type,
    email: data.email,
    gender: data.gender,
    birth_date: data.birth_date,
    address: data.address,
    phone: data.phone,
    weight: data.weight,
    height: data.height,
    hobbies: data.hobbies,
    sports: data.sports,
    instruments: data.instruments,
    status: "PENDING",
    emergency_phone: emergencyPhone,
  };
};

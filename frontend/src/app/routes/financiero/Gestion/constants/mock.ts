import type { Cuota } from "@/types/cuota.type";
import type { Member } from "@/types/member.type";
import type { Section } from "@/types/section.type";
import type { Subgroup } from "@/types/subgroup.type";

export const mockCuotas: Cuota[] = [
  {
    fee_id: "1",
    name: "Cuota mensual",
    description: "Cuota mensual de 10000",
    amount: 10000,
    periodicity: "MONTH",
    scope: "ALL",
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
    associated_to: null
  },
  {
    fee_id: "2",
    name: "Cuota anual",
    description: "Cuota anual de 100000",
    amount: 100000,
    periodicity: "YEAR",
    scope: "ALL",
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 365)),
    associated_to: null
  },
  {
    fee_id: "3",
    name: "Cuota trimestral",
    description: "Cuota trimestral de 30000",
    amount: 30000,
    periodicity: "QUARTER",
    scope: "SCOUT",
    start_date: new Date(),
    // Mas dos dias
    end_date: new Date(new Date().setDate(new Date().getDate() + 90)),
    associated_to: {
      id: "3",
      name: "Carlos Rodríguez",
    }
  },
  {
    fee_id: "4",
    name: "Cuota anual",
    description: "Cuota anual de 300000",
    amount: 300000,
    periodicity: "YEAR",
    scope: "SECTION",
    start_date: new Date(),
    // Mas dos dias
    end_date: new Date(new Date().setDate(new Date().getDate() + 365)),
    associated_to: {
      id: "4",
      name: "Squad",
    }
  },
];

export const mockMembers: Member[] = [
  {
    memberId: 1,
    firstName: "Juan",
    lastName: "Rodríguez",
    subgroup_id: 1,
    subgroup_name: "Patrulla canina",
    sectionId: 1,
    sectionName: "Lobatos",
    age: 12,
  },
  {
    memberId: 2,
    firstName: "María",
    lastName: "García",
    subgroup_id: 1,
    subgroup_name: "Patrulla canina",
    sectionId: 1,
    sectionName: "Lobatos",
    age: 11,
  },
  {
    memberId: 3,
    firstName: "Carlos",
    lastName: "Rodríguez",
    subgroup_id: 1,
    subgroup_name: "Patrulla canina",
    sectionId: 1,
    sectionName: "Lobatos",
    age: 12,
  },
];

export const mockSubgroups: Subgroup[] = [
  {
    id: 1,
    name: "Patrulla canina",
  },
  {
    id: 2,
    name: "Patrulla de orangutanes",
  },
  {
    id: 3,
    name: "Patrulla de pingüinos",
  },
];

export const mockSections: Section[] = [
  {
    id: 1,
    name: "Tropa",
  },
  {
    id: 2,
    name: "Clan",
  },
  {
    id: 3,
    name: "Squad",
  },
];
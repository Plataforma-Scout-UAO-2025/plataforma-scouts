import type { Cuota } from "@/types/cuota.type";

export const mockCuotas: Cuota[] = [
  {
    fee_plan_id: "1",
    name: "Cuota mensual",
    description: "Cuota mensual de 10000",
    amount: 10000,
    periodicity: "MONTH",
    scope: "ALL",
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 2)),
    member: {
      member_id: 1,
      first_name: "Juan",
      last_name: "Rodríguez",
      subgroup: "Lobatos",
      age: 12,
      tenant_id: 1,
    },
  },
  {
    fee_plan_id: "2",
    name: "Cuota anual",
    description: "Cuota anual de 100000",
    amount: 100000,
    periodicity: "YEAR",
    scope: "ALL",
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 2)),
    member: {
      member_id: 2,
      first_name: "María",
      last_name: "García",
      subgroup: "Lobatos",
      age: 11,
      tenant_id: 1,
    },
  },
  {
    fee_plan_id: "3",
    name: "Cuota trimestral",
    description: "Cuota trimestral de 30000",
    amount: 30000,
    periodicity: "QUARTER",
    scope: "SCOUT",
    start_date: new Date(),
    // Mas dos dias
    end_date: new Date(new Date().setDate(new Date().getDate() + 2)),
    member: {
      member_id: 3,
      first_name: "Carlos",
      last_name: "Rodríguez",
      subgroup: "Lobatos",
      age: 12,
      tenant_id: 1,
    },
  },
];

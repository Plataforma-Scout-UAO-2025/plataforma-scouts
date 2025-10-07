export type Periodicity = "SINGLE" | "MONTH" | "QUARTER" | "YEAR";
export type Scope = "ALL" | "SCOUT" | "SUBGROUP" | "SECTION";

export interface CreateCuotaDto {
  name: string;
  description: string;
  amount: number;
  periodicity: Periodicity;
  scope: Scope;
  start_date: Date;
  end_date?: Date;
  // Solo cuando el scope es SCOUT, SUBGROUP o SECTION
  user_id?: number;
  subgroup_id?: number;
  section_id?: number;
}

// Editar y ver cuota
export type Cuota = {
  fee_id: string;
  amount: number;
  name: string
  description: string;
  periodicity: Periodicity;
  scope: Scope;
  start_date: Date;
  end_date?: Date;
  associated_to: {
    id: string;
    name: string;
  } | null;
};

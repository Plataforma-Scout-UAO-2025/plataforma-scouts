import type { Section } from "./section.type";

export type Subgroup = {
  id: number;
  name: string;
  description?: string;
  section?: Section[];
};
export type Cargo = {
  id: string;
  nombre: string;
  titular?: string;
  visible: boolean;
  descripcion?: string; 
};

export type Nivel = {
  id: string;
  nombre: string;
  visible: boolean;
  descripcion?: string; 
  cargos: Cargo[];
};

export type OrganigramaNiveles = {
  anio: number;
  niveles: Nivel[];
};


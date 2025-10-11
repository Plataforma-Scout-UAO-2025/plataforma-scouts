export type Cargo = {
  id: string;
  nombre: string;
  titular?: string;
  visible: boolean;
  descripcion?: string;  // Descripción opcional para dar más contexto al cargo.
};

export type Nivel = {
  id: string;
  nombre: string;
  visible: boolean;
  descripcion?: string;  // Descripción opcional para dar más contexto al nivel.
  cargos: Cargo[];  // Lista de cargos asociados a este nivel.
};

export type OrganigramaNiveles = {
  anio: number;  // Año de referencia para los niveles organizativos.
  niveles: Nivel[];  // Lista de niveles dentro del organigrama.
};

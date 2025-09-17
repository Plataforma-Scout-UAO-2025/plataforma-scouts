export interface Rama {
  id: string;
  nombre: string;
  nombreSubramaSingular: string;
  nombreSubramaPlural: string;
  icono?: string;
  descripcion?: string;
  año: number;
}

export interface Subrama {
  id: string;
  nombre: string;
  ramaId: string;
  icono?: string;
  descripcion?: string;
  año: number;
}

export const ramasData: Rama[] = [
  {
    id: "1",
    nombre: "Manada",
    nombreSubramaSingular: "Seisena",
    nombreSubramaPlural: "Seisenas",
    descripcion: "Grupo de niños y niñas de 7 a 11 años que viven aventuras en la selva siguiendo las historias del Libro de la Selva.",
    año: 2025
  },
  {
    id: "2", 
    nombre: "Tropa",
    nombreSubramaSingular: "Patrulla",
    nombreSubramaPlural: "Patrullas",
    descripcion: "Jóvenes de 11 a 15 años que viven aventuras al aire libre desarrollando habilidades de liderazgo y trabajo en equipo.",
    año: 2025
  },
  {
    id: "3",
    nombre: "Clan",
    nombreSubramaSingular: "Equipo",
    nombreSubramaPlural: "Equipos", 
    descripcion: "Jóvenes de 15 a 18 años que se enfocan en proyectos de servicio comunitario y desarrollo personal.",
    año: 2025
  }
];

export const subramasData: Subrama[] = [
  {
    id: "1",
    nombre: "Patrulla de Leones",
    ramaId: "2",
    descripcion: "Patrulla caracterizada por la valentía y el liderazgo, representada por el león como símbolo de fuerza.",
    año: 2025
  },
  {
    id: "2", 
    nombre: "Patrulla de Halcones",
    ramaId: "2",
    descripcion: "Patrulla que representa la agilidad y la visión, con el halcón como símbolo de perspectiva y rapidez.",
    año: 2025
  }
];
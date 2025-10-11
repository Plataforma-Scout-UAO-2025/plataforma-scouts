import type { OrganigramaNiveles } from "../types/niveles.types";

export const nivelesMock2025: OrganigramaNiveles = {
  anio: 2025,
  niveles: [
    {
      id: "nivel-asamblea",
      nombre: "Asamblea General de Padres y Jefatura",
      descripcion: "Órgano máximo de toma de decisiones y liderazgo.",
      visible: true,
      cargos: [],
    },
    {
      id: "nivel-corte-honor",
      nombre: "Corte de Honor",
      descripcion: "Órgano que conecta con los comités y consejos.",
      visible: true,
      cargos: [],
    },
    {
      id: "nivel-comite-jefatura",
      nombre: "Comité de Jefatura",
      descripcion: "Comité encargado de la dirección y coordinación de las actividades.",
      visible: true,
      cargos: [
        {
          id: "c1",
          nombre: "Director de Región",
          titular: "Juan Carlos Gómez",
          descripcion: "Dirige y coordina las actividades de la región.",
          visible: true,
        },
        {
          id: "c2",
          nombre: "Sub Director de Región",
          titular: "Ana María Pérez",
          descripcion: "Apoya al Director de Región en las funciones asignadas.",
          visible: true,
        },
        {
          id: "c3",
          nombre: "Jefe de Grupo",
          titular: "Carlos Rodríguez",
          descripcion: "Encargado de la gestión de los grupos dentro de la región.",
          visible: true,
        },
        {
          id: "c4",
          nombre: "Sub Jefe de Grupo",
          titular: "Beatriz Sánchez",
          descripcion: "Apoya en la gestión de los grupos de la región.",
          visible: true,
        },
        {
          id: "c5",
          nombre: "Jefe de Rama",
          titular: "Luis García",
          descripcion: "Coordina las actividades de cada rama dentro de la región.",
          visible: true,
        },
      ],
    },
    {
      id: "nivel-comite-padres",
      nombre: "Comité de Padres",
      descripcion: "Comité encargado de la gestión administrativa y coordinación con los padres.",
      visible: true,
      cargos: [
        {
          id: "c6",
          nombre: "Presidente",
          titular: "Pedro Martínez",
          descripcion: "Representa al Comité de Padres en todas las instancias.",
          visible: true,
        },
        {
          id: "c7",
          nombre: "Vicepresidente",
          titular: "Laura López",
          descripcion: "Asiste al Presidente en sus funciones.",
          visible: true,
        },
        {
          id: "c8",
          nombre: "Secretario",
          titular: "Ricardo Fernández",
          descripcion: "Gestiona las actas y la correspondencia del comité.",
          visible: true,
        },
        {
          id: "c9",
          nombre: "Tesorero",
          titular: "Isabel Romero",
          descripcion: "Administra los fondos y recursos del Comité de Padres.",
          visible: true,
        },
        {
          id: "c10",
          nombre: "Fiscal",
          titular: "Julio López",
          descripcion: "Supervisa la correcta gestión de los recursos financieros.",
          visible: true,
        },
        {
          id: "c11",
          nombre: "Vocal",
          titular: "Carlos Pérez",
          descripcion: "Apoya en las decisiones y gestión del Comité de Padres.",
          visible: true,
        },
      ],
    },
    {
      id: "nivel-consejo-region",
      nombre: "Consejo de Región",
      descripcion: "Consejo encargado de las decisiones estratégicas a nivel regional.",
      visible: true,
      cargos: [],
    },
  ],
};

export const nivelesMock2024: OrganigramaNiveles = {
  anio: 2024,
  niveles: [
    {
      id: "nivel-admin-24",
      nombre: "Administrativo",
      descripcion: "Gestión financiera y documental.",
      visible: true,
      cargos: [
        {
          id: "c4",
          nombre: "Tesorero",
          titular: "Ana Ramírez",
          descripcion: "Administra recursos y estados financieros.",
          visible: true,
        },
      ],
    },
  ],
};

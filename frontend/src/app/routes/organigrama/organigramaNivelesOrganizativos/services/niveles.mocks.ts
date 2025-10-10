import type { OrganigramaNiveles } from "../types/niveles.types";

export const nivelesMock2025: OrganigramaNiveles = {
  anio: 2025,
  niveles: [
    {
      id: "nivel-ctrl",
      nombre: "Control y Vigilancia",
      descripcion: "Órgano de control interno del grupo.",
      visible: true,
      cargos: [
        {
          id: "c1",
          nombre: "Fiscal de Grupo",
          titular: "María Fernanda Torres",
          descripcion: "Vigila la gestión y cumplimiento normativo.",
          visible: true,
        },
      ],
    },
    {
      id: "nivel-admin",
      nombre: "Administrativo",
      descripcion: "Gestión financiera y documental.",
      visible: true,
      cargos: [
        {
          id: "c2",
          nombre: "Tesorero",
          titular: "Luis Fernández",
          descripcion: "Administra recursos y estados financieros.",
          visible: true,
        },
        {
          id: "c3",
          nombre: "Secretario",
          titular: "Patricia López",
          descripcion: "Custodia actas y correspondencia.",
          visible: true,
        },
      ],
    },
    {
      id: "nivel-tecnico",
      nombre: "Técnico",
      descripcion: "Apoyo técnico y operativo.",
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

import type { OrganigramaNiveles } from "../types/niveles.types";

export const nivelesMock2025: OrganigramaNiveles = {
  anio: 2025,
  niveles: [
    {
      id: "nivel-ctrl",
      nombre: "Control y Vigilancia",
      visible: true,
      cargos: [
        { id: "c1", nombre: "Fiscal de Grupo", titular: "María Fernanda Torres", visible: true },
      ],
    },
    {
      id: "nivel-admin",
      nombre: "Administrativo",
      visible: true,
      cargos: [
        { id: "c2", nombre: "Tesorero", titular: "Luis Fernández", visible: true },
        { id: "c3", nombre: "Secretario", titular: "Patricia López", visible: true },
      ],
    },
    {
      id: "nivel-tecnico",
      nombre: "Técnico",
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
      visible: true,
      cargos: [
        { id: "c4", nombre: "Tesorero", titular: "Ana Ramírez", visible: true },
      ],
    },
  ],
};

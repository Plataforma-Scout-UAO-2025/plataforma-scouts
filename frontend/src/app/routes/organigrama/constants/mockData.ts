import type { Rama } from '../types/rama.type';

export const mockRamas: Rama[] = [
  {
    id: '1',
    nombre: 'Manada',
    descripcion: '',
    edadMinima: 7,
    edadMaxima: 10,
    año: 2024,
    estado: 'activa',
    fechaCreacion: '2024-01-15',
    subramas: []
  },
  {
    id: '2',
    nombre: 'Tropa',
    descripcion: '',
    edadMinima: 11,
    edadMaxima: 14,
    año: 2024,
    estado: 'activa',
    fechaCreacion: '2024-01-15',
    subramas: [
      {
        id: 'sub-2',
        nombre: 'Patrulla Leones',
        descripcion: '',
        ramaId: '2',
        lider: 'Carlos Mendez',
        estado: 'activa',
        fechaCreacion: '2024-02-01',
        numeroMiembros: 12
      },
      {
        id: 'sub-3',
        nombre: 'Patrulla Leones',
        descripcion: '',
        ramaId: '2',
        lider: 'María Rodriguez',
        estado: 'activa',
        fechaCreacion: '2024-02-15',
        numeroMiembros: 10
      }
    ]
  },
  {
    id: '3',
    nombre: 'Manada',
    descripcion: '',
    edadMinima: 7,
    edadMaxima: 10,
    año: 2024,
    estado: 'activa',
    fechaCreacion: '2024-01-15',
    subramas: []
  }
];

export const availableYears = [2024, 2023, 2022, 2021, 2020];
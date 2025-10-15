import type { Branch as Rama } from '../types/frontend';

export const mockRamas: Rama[] = [
  {
    id: '1',
  sectionId: 'section-1',
    galleryObjectIds: [],
    name: 'Manada',
    description: '',
    minAge: 7,
    maxAge: 10,
    year: 2024,
    status: 'active',
    createdAt: '2024-01-15',
    subgroups: []
  },
  {
    id: '2',
  sectionId: 'section-2',
    galleryObjectIds: [],
    name: 'Tropa',
    description: '',
    minAge: 11,
    maxAge: 14,
    year: 2024,
    status: 'active',
    createdAt: '2024-01-15',
    subgroups: [
      {
        id: 'sub-2',
        subgroup_id: 'subgroup-sub-2',
        description: '', // Replaced subgroupDescription with description
        galleryObjectIds: [],
        name: 'Patrulla Leones',
        branchId: '2', // Removed duplicate branchId
        leader: 'Carlos Mendez',
        status: 'active',
        createdAt: '2024-02-01',
        memberCount: 12
      },
      {
        id: 'sub-3',
        subgroup_id: 'subgroup-sub-3',
        description: '', // Replaced subgroupDescription with description
        galleryObjectIds: [],
        name: 'Patrulla Águilas',
        branchId: '2', // Removed duplicate branchId
        leader: 'María Rodriguez',
        status: 'active',
        createdAt: '2024-02-15',
        memberCount: 10
      }
    ]
  },
  {
    id: '3',
  sectionId: 'section-3',
    galleryObjectIds: [],
    name: 'Manada',
    description: '',
    minAge: 7,
    maxAge: 10,
    year: 2024,
    status: 'active',
    createdAt: '2024-01-15',
    subgroups: []
  }
];

export const availableYears = [2024, 2023, 2022, 2021, 2020];
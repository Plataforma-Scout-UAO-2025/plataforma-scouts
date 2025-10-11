import type { Member } from '../members/types/member.type';

/**
 * Datos mock compartidos para el módulo de guardians/acudientes
 * Este archivo centraliza los datos de prueba para evitar duplicación
 * y facilitar la migración futura a datos reales desde la BD
 */

export const mockMembersData: Member[] = [
  {
    id: 1,
    firstName: "José Alberto",
    lastName: "Gutierrez Jimenez",
    email: "jose.gutierrez@email.com",
    documentType: "CC",
    identification: "CC 1123123123010",
    gender: "MALE",
    birthDate: "2010-03-14",
    phone: "+57 312 345 6789",
    address: "Calle 5 # 10-20, Cali",
    role: "Scout Aspirante",
    acceptanceDate: "2025-01-15",
    isActive: true,
    weight: "45 kg",
    height: "1.55 m",
    hobbies: "Dibujar, Leer, Tocar Guitarra",
    sports: "Voleibol",
    instruments: "Guitarra",
    emergencyContacts: [
      {
        id: 1,
        fullName: "María Gómez",
        relationship: "Madre",
        phone: "+57 310 987 6543"
      },
      {
        id: 2,
        fullName: "Carlos Rojas",
        relationship: "Padre",
        phone: "+57 300 112 2334"
      }
    ],
    createdAt: "2025-08-13T16:30:00",
    city: "Cali",
    rama: "Lobatos",
  },
  {
    id: 2,
    firstName: "Ana María",
    lastName: "López Hernández",
    email: "ana.lopez@email.com",
    documentType: "TI",
    identification: "TI 1098765432",
    gender: "FEMALE",
    birthDate: "2011-07-22",
    phone: "+57 315 678 9012",
    address: "Carrera 12 # 25-30, Cali",
    role: "Scout Aspirante",
    acceptanceDate: "2025-02-01",
    isActive: true,
    weight: "40 kg",
    height: "1.50 m",
    hobbies: "Natación, Pintura",
    sports: "Natación",
    instruments: "Piano",
    emergencyContacts: [
      {
        id: 3,
        fullName: "Patricia Hernández",
        relationship: "Madre",
        phone: "+57 314 555 7777"
      }
    ],
    createdAt: "2025-08-15T10:15:00",
    city: "Cali",
    rama: "Lobatos",
  },
  {
    id: 3,
    firstName: "Luis Fernando",
    lastName: "Martínez Silva",
    email: "luis.martinez@email.com",
    documentType: "CC",
    identification: "CC 1087654321",
    gender: "MALE",
    birthDate: "2009-11-08",
    phone: "+57 318 456 7890",
    address: "Avenida 6 # 15-45, Cali",
    role: "Scout",
    acceptanceDate: "2024-09-10",
    isActive: true,
    weight: "50 kg",
    height: "1.60 m",
    hobbies: "Fútbol, Lectura, Videojuegos",
    sports: "Fútbol",
    instruments: "Flauta",
    emergencyContacts: [
      {
        id: 4,
        fullName: "Sandra Silva",
        relationship: "Madre",
        phone: "+57 311 777 8888"
      }
    ],
    createdAt: "2024-09-10T14:20:00",
    city: "Cali",
    rama: "Scouts",
  }
];

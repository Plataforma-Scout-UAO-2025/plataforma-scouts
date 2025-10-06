import type {
  Member,
  MemberStats,
} from "../../app/routes/adminGrupal/Miembros/types/member.type";

export const mockMembers: Member[] = [
    {
        id: "1",
        firstName: "Juan Carlos",
        lastName: "Pérez González",
        identification: "12345678",
        createdAt: "2023-01-15T10:00:00Z",
        status: "Activo",
        statusAccount: "Verificado",
        city: "Bogotá",
        branch: "Scout",
        orders: [
            {
                orderNumber: "ORD-001",
                concept: "Cuota de Membresía",
                value: "$50,000",
                date: "2023-01-15",
                status: "Pagado",
            },
        ],
    },
    {
        id: "2",
        firstName: "María José",
        lastName: "López Martínez",
        identification: "87654321",
        createdAt: "2022-09-10T14:30:00Z",
        status: "Activo",
        statusAccount: "Verificado",
        city: "Medellín",
        branch: "Rover",
        orders: [
            {
                orderNumber: "ORD-002",
                concept: "Cuota de Actividad",
                value: "$30,000",
                date: "2023-06-15",
                status: "Pagado",
            },
        ],
    },
    {
        id: "3",
        firstName: "Carlos Andrés",
        lastName: "Rodríguez Silva",
        identification: "11223344",
        createdAt: "2023-03-20T16:45:00Z",
        status: "Inactivo",
        statusAccount: "Pendiente",
        city: "Cali",
        branch: "Cub",
        orders: [],
    },
];

export const mockMemberStats: MemberStats = {
  totalMembers: 3,
  activeMembers: 2,
  membersByBranch: {
    Scout: 1,
    Rover: 1,
    Cub: 1,
  },
  membersByCity: {
    Bogotá: 1,
    Medellín: 1,
    Cali: 1,
  },
};

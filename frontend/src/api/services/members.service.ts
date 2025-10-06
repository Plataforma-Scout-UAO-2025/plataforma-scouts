import { apiClient } from "../client";
import type { ApiResponse, PaginatedResponse } from "../api.type";
import type {
  Member,
  MemberFilters,
  MemberStats,
} from "../../app/routes/adminGrupal/Miembros/types/member.type";
import { mockMembers, mockMemberStats } from "../mocks/members.mock";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "false";

const MEMBERS_BASE_URL = "/members";

type MemberStatus = "ACCEPTED" | "NOT_ACCEPTED" | "PENDING";

// Servicio con datos mock para desarrollo
const mockService = {
  getAll: async (
    filters?: MemberFilters
  ): Promise<PaginatedResponse<Member>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...mockMembers];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (member) =>
          member.first_name.toLowerCase().includes(search) ||
          member.last_name.toLowerCase().includes(search) ||
          member.identification.includes(search) ||
          member.branch.toLowerCase().includes(search)
      );
    }

    if (filters?.city) {
      filteredData = filteredData.filter(
        (member) => member.city === filters.city
      );
    }

    if (filters?.branch) {
      filteredData = filteredData.filter(
        (member) => member.branch === filters.branch
      );
    }

    if (filters?.status) {
      filteredData = filteredData.filter(
        (member) => member.status === filters.status
      );
    }

    return {
      success: true,
      data: filteredData,
      message: "Members retrieved successfully",
      pagination: {
        page: 1,
        limit: 10,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / 10),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Member>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const member = mockMembers.find((m) => m.member_id === id);

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      success: true,
      data: member,
      message: "Member retrieved successfully",
    };
  },

  create: async (
    data: Omit<Member, "id" | "createdAt">
  ): Promise<ApiResponse<Member>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newMember: Member = {
      ...data,
      member_id: `mock-${Date.now()}`,
      acceptance_date: new Date().toISOString(),
    };

    mockMembers.push(newMember);

    return {
      success: true,
      data: newMember,
      message: "Member created successfully",
    };
  },

  update: async (
    id: string,
    data: Partial<Member>
  ): Promise<ApiResponse<Member>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockMembers.findIndex((m) => m.member_id === id);
    if (index === -1) {
      throw new Error("Member not found");
    }

    const updatedMember = {
      ...mockMembers[index],
      ...data,
    };

    mockMembers[index] = updatedMember;

    return {
      success: true,
      data: updatedMember,
      message: "Member updated successfully",
    };
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockMembers.findIndex((m) => m.member_id === id);
    if (index === -1) {
      throw new Error("Member not found");
    }

    mockMembers.splice(index, 1);

    return {
      success: true,
      data: null,
      message: "Member deleted successfully",
    };
  },

  getStats: async (): Promise<ApiResponse<MemberStats>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockMemberStats,
      message: "Statistics retrieved successfully",
    };
  },

  // ✅ Métodos faltantes agregados
  getByStatus: async (status: string): Promise<Member[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filteredMembers = mockMembers.filter(
      (member) => member.status === status
    );

    return filteredMembers;
  },

  getDetails: async (id: string): Promise<Member> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const member = mockMembers.find((m) => m.member_id === id);

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  },

  updateStatus: async (id: string, status: MemberStatus): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockMembers.findIndex((m) => m.member_id === id);
    if (index === -1) {
      throw new Error("Member not found");
    }

    mockMembers[index] = {
      ...mockMembers[index],
      status,
    };
  },
};

const realService = {
  // Obtener todos los miembros con filtros opcionales
  getAll: async (
    filters?: MemberFilters
  ): Promise<PaginatedResponse<Member>> => {
    const status = filters?.status || "ACCEPTED";

    const params: Record<string, any> = { status };
    if (filters?.search) params.search = filters.search;
    if (filters?.city) params.city = filters.city;
    if (filters?.branch) params.branch = filters.branch;

    const res = await apiClient.get(
      `${MEMBERS_BASE_URL}/list_members_by_status`,
      { params }
    );

    const data = res.data;

    return {
      success: true,
      data,
      message: "Miembros cargados exitosamente",
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || data.length,
        total: data.length,
        totalPages: 1,
      },
    };
  },

  // Obtener miembro por ID (genérico)
  getById: async (id: string): Promise<ApiResponse<Member>> => {
    const res = await apiClient.get(`${MEMBERS_BASE_URL}/list_member_by_id`, {
      params: { id },
    });
    return {
      success: true,
      data: res.data,
      message: "Miembro obtenido exitosamente",
    };
  },

  // Crear nuevo miembro
  create: async (
    data: Omit<Member, "id" | "createdAt">
  ): Promise<ApiResponse<Member>> => {
    const res = await apiClient.post(MEMBERS_BASE_URL, data);
    return {
      success: true,
      data: res.data,
      message: "Miembro creado exitosamente",
    };
  },

  // Actualizar miembro existente
  update: async (
    id: string,
    data: Partial<Member>
  ): Promise<ApiResponse<Member>> => {
    const res = await apiClient.put(`${MEMBERS_BASE_URL}/${id}`, data);
    return {
      success: true,
      data: res.data,
      message: "Miembro actualizado exitosamente",
    };
  },

  // Eliminar miembro
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await apiClient.delete(`${MEMBERS_BASE_URL}/${id}`);
    return {
      success: true,
      data: null,
      message: "Miembro eliminado exitosamente",
    };
  },

  // Obtener estadísticas
  getStats: async (): Promise<ApiResponse<MemberStats>> => {
    const res = await apiClient.get(`${MEMBERS_BASE_URL}/stats`);
    return {
      success: true,
      data: res.data,
      message: "Estadísticas obtenidas exitosamente",
    };
  },

  // Obtener miembros por estado (PENDING, ACCEPTED, NOT_ACCEPTED)
  getByStatus: async (status: string): Promise<Member[]> => {
    const res = await apiClient.get(
      `${MEMBERS_BASE_URL}/list_members_by_status`,
      {
        params: { status },
      }
    );
    return res.data;
  },

  // Obtener detalles completos por ID
  getDetails: async (id: string): Promise<Member> => {
    const res = await apiClient.get(`${MEMBERS_BASE_URL}/list_member_by_id`, {
      params: { id },
    });
    return res.data;
  },

  // Actualizar estado de un miembro (aceptar/rechazar)
  updateStatus: async (id: string, status: MemberStatus): Promise<void> => {
    await apiClient.put(
      `${MEMBERS_BASE_URL}/update_member_status/${id}`,
      null,
      {
        params: { status },
      }
    );
  },
};

export const membersService = USE_MOCK_DATA ? mockService : realService;

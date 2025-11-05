import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getGroup,
  getGroups,
  updateGroup,
  createGroup,
  getMembersCountByGroup,
  getTotalMembersCount,
  getActiveGroupsCount,
  getInactiveGroupsCount,
  getTopGroupsByMembers,
  getGroupsWithAdmins,
  createGroupAdmin,
  createGroupAdminWithConnection,
  validateGroupSlug,
} from "@/api/groupsApi";
import type {
  GroupResponseDTO as Group,
  UpdateGroupDTO,
  TopGroupByMembersDTO,
  GroupWithAdminBackendDTO,
} from "@/types/group.type";

interface CreateGroupRequest {
  tenant_id: string;
  slug: string;
  name: string;
  district?: string | null;
  identifier_number?: string | null;
  address?: string | null;
  phone?: string | null;
  email: string;
  founded_in?: string | null;
  motto?: string | null;
  mission?: string | null;
  vision?: string | null;
  history?: string | null;
  logo_object_id?: string | null;
  scarf_object_id?: string | null;
  social_links?: Record<string, unknown> | null;
  config?: Record<string, unknown> | null;
  is_active?: boolean;
  status?: string;
}

// Obtener datos de un grupo
export const fetchGroupAction = createAsyncThunk<
  Group,
  string,
  { rejectValue: string | string[] }
>("group/fetch", async (tenantId, { rejectWithValue }) => {
  try {
    const group = await getGroup(tenantId);
    return group;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al obtener el grupo";
    return rejectWithValue(errorMessage);
  }
});

export const fetchGroupsAction = createAsyncThunk(
  "groups/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const groups = await getGroups();
      return groups;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al obtener los grupos";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener grupos con administradores
export const fetchGroupsWithAdminsAction = createAsyncThunk<
  GroupWithAdminBackendDTO[],
  void,
  { rejectValue: string }
>("groups/fetchWithAdmins", async (_, { rejectWithValue }) => {
  try {
    const groupsWithAdmins = await getGroupsWithAdmins();
    return groupsWithAdmins;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as {
      error?: string;
      message?: string;
    };
    const errorMessage =
      errorData?.error ||
      errorData?.message ||
      `Error ${
        axiosError.response?.status || "desconocido"
      } al obtener los grupos con administradores`;

    return rejectWithValue(errorMessage);
  }
});

// Actualizar datos de un grupo
export const updateGroupAction = createAsyncThunk<
  { message: string },
  { tenantId: string; groupSlug: string; updates: Partial<UpdateGroupDTO> },
  { rejectValue: { error: string } }
>(
  "group/update",
  async ({ tenantId, groupSlug, updates }, { rejectWithValue }) => {
    try {
      console.log("Updating group with data:", {
        tenantId,
        groupSlug,
        updates,
      });
      const response = await updateGroup(tenantId, groupSlug, updates);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al actualizar el grupo";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Crear un nuevo grupo
export const createGroupAction = createAsyncThunk<
  { message: string; newGroup?: Group },
  CreateGroupRequest,
  { rejectValue: { error: string } }
>(
  "group/create",
  async (groupData: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const response = await createGroup(groupData);

      return {
        message: "Grupo creado exitosamente",
        newGroup: response,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al crear el grupo";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Stats de grupos

// Obtener conteo de miembros por grupo
export const fetchMembersCountByGroupAction = createAsyncThunk(
  "groups/membersCount",
  async (_, { rejectWithValue }) => {
    try {
      const membersCount = await getMembersCountByGroup();
      return membersCount;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al obtener el conteo de miembros por grupo";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener conteo total de miembros
export const fetchTotalMembersCountAction = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("groups/totalMembersCount", async (_, { rejectWithValue }) => {
  try {
    const response = await getTotalMembersCount();
    return response.total_members_count;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al obtener el conteo total de miembros";
    return rejectWithValue(errorMessage);
  }
});

// Obtener conteo de grupos activos
export const fetchActiveGroupsCountAction = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("groups/activeGroupsCount", async (_, { rejectWithValue }) => {
  try {
    const response = await getActiveGroupsCount();
    return response.active_groups_count;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al obtener el conteo de grupos activos";
    return rejectWithValue(errorMessage);
  }
});

// Obtener conteo de grupos inactivos
export const fetchInactiveGroupsCountAction = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("groups/inactiveGroupsCount", async (_, { rejectWithValue }) => {
  try {
    const response = await getInactiveGroupsCount();
    return response.inactive_groups_count;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al obtener el conteo de grupos inactivos";
    return rejectWithValue(errorMessage);
  }
});

// Obtener grupos con más miembros
export const fetchTopGroupsByMembersAction = createAsyncThunk<
  TopGroupByMembersDTO[],
  void,
  { rejectValue: string }
>("groups/topGroupsByMembers", async (_, { rejectWithValue }) => {
  try {
    const response = await getTopGroupsByMembers();
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al obtener los grupos con más miembros";
    return rejectWithValue(errorMessage);
  }
});

// Crear administrador de grupo
export const createGroupAdminAction = createAsyncThunk<
  { message: string; userId: string; email: string; assignedRole: string },
  {
    tenantId: string;
    slug: string;
    data: {
      email: string;
      password: string;
      username: string;
      member: Record<string, unknown>;
    };
  },
  { rejectValue: { error: string } }
>(
  "groups/createAdmin",
  async ({ tenantId, slug, data }, { rejectWithValue }) => {
    try {
      const response = await createGroupAdmin(tenantId, slug, data);
      return {
        message: "Administrador de grupo creado exitosamente",
        userId: response.userId,
        email: response.email,
        assignedRole: response.assignedRole,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as {
        error?: string;
        message?: string;
      };
      const errorMessage =
        errorData?.error ||
        errorData?.message ||
        "Error al crear el administrador de grupo";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Crear administrador de grupo con conexión específica (usa la conexión correcta del grupo)
export const createGroupAdminWithConnectionAction = createAsyncThunk<
  { message: string; userId: string; email: string; assignedRole: string },
  {
    tenantId: string;
    slug: string;
    data: {
      email: string;
      password: string;
      username: string;
      member: Record<string, unknown>;
    };
  },
  { rejectValue: { error: string } }
>(
  "groups/createAdminWithConnection",
  async ({ tenantId, slug, data }, { rejectWithValue }) => {
    try {
      const response = await createGroupAdminWithConnection(
        tenantId,
        slug,
        data
      );
      return {
        message: "Administrador de grupo creado exitosamente.",
        userId: response.userId,
        email: response.email,
        assignedRole: response.assignedRole,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as {
        error?: string;
        message?: string;
      };
      const errorMessage =
        errorData?.error ||
        errorData?.message ||
        "Error al crear el administrador de grupo";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Validar slug de grupo
export const validateGroupSlugAction = createAsyncThunk<
  { slug: string; valid: boolean; reason: string | null; message: string | null },
  { tenantId: string; slug: string },
  { rejectValue: { error: string } }
>("groups/validateSlug", async ({ tenantId, slug }, { rejectWithValue }) => {
  try {
    const response = await validateGroupSlug(tenantId, slug);
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as {
      error?: string;
      message?: string;
    };
    const errorMessage =
      errorData?.error || errorData?.message || "Error al validar el slug";
    return rejectWithValue({ error: errorMessage });
  }
});

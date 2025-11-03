import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getGroup, getGroups, updateGroup, createGroup, getMembersCountByGroup, getTotalMembersCount, getActiveGroupsCount, getInactiveGroupsCount, getTopGroupsByMembers, createGroupMultipart, validateSlug } from "@/api/groupsApi";
import type {
  GroupResponseDTO as Group,
  UpdateGroupDTO,
  TopGroupByMembersDTO,
} from "@/types/group.type";

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

// Actualizar datos de un grupo
export const updateGroupAction = createAsyncThunk<
  { message: string },
  { tenantId: string; groupSlug: string; updates: Partial<UpdateGroupDTO> },
  { rejectValue: { error: string } }
>("group/update", async ({ tenantId, groupSlug, updates }, { rejectWithValue }) => {
  try {
    console.log("Updating group with data:", { tenantId, groupSlug, updates });
    const response = await updateGroup(tenantId, groupSlug, updates);
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al actualizar el grupo";
    return rejectWithValue({ error: errorMessage });
  }
});

// Crear un nuevo grupo
export const createGroupAction = createAsyncThunk<
  { message: string; newGroup?: Group },
  Group,
  { rejectValue: { error: string } }
>("group/create", async (groupData: Group, { rejectWithValue }) => {
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
});

// Crear grupo (multipart) usando el endpoint /tenants/{tenantId}/groups
export const createGroupMultipartAction = createAsyncThunk<
  { message: string; newGroup?: Group },
  { tenantId: string; dto: Record<string, unknown>; image?: File },
  { rejectValue: { error: string } }
>("group/createMultipart", async ({ tenantId, dto, image }, { rejectWithValue }) => {
  try {
    const response = await createGroupMultipart(tenantId, dto, image);
    return {
      message: "Grupo creado exitosamente",
      newGroup: response,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string; message?: string };
    const errorMessage = errorData?.error || errorData?.message || "Error al crear el grupo";
    return rejectWithValue({ error: errorMessage });
  }
});

// Validar slug
export const validateSlugAction = createAsyncThunk<
  { slug: string; valid: boolean; reason?: string; message?: string },
  string,
  { rejectValue: string }
>("group/validateSlug", async (slug: string, { rejectWithValue }) => {
  try {
    const result = await validateSlug(slug);
    return result;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string; message?: string };
    const errorMessage = errorData?.error || errorData?.message || "Error al validar el slug";
    return rejectWithValue(errorMessage);
  }
});

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
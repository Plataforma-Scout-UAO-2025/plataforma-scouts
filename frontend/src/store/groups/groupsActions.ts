import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getGroup, getGroups, updateGroup, createGroup, getMembersCountByGroup, getTotalMembersCount, getActiveGroupsCount, getInactiveGroupsCount, getTopGroupsByMembers } from "@/api/groupsApi";
import type {
  GroupResponseDTO as Group,
  UpdateGroupDTO,
  TopGroupByMembersDTO,
} from "@/types/group.type";

// Obtener datos de un grupo
export const fetchGroupAction = createAsyncThunk<
  Group,
  number,
  { rejectValue: string | string[] }
>("group/fetch", async (id, { rejectWithValue }) => {
  try {
    const group = await getGroup(id);
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
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getGroup,
  getGroups,
  updateGroup,
  createGroup,
  getMembersCountByGroup,
} from "@/api/groupsApi";
import type {
  GroupResponseDTO as Group,
  UpdateGroupDTO,
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
  { uid: string; updates: Partial<UpdateGroupDTO> },
  { rejectValue: { error: string } }
>("group/update", async ({ uid, updates }, { rejectWithValue }) => {
  try {
    const response = await updateGroup(uid, updates);
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

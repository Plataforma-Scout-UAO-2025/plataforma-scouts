import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getMember,
  getMembers,
  getMembersByStatus,
  getMembersWithBranch,
  updateMember,
  assignSubgroupAndSection,
  updateMemberByDto,
  updateMemberStatus,
  createMember,
  createMemberWithSchool,
  createMemberAuth0,
  createScoutAuth0,
  getSchoolDataByMemberId,
} from "@/api/membersApi";
import type { Member, UpdateMember } from "@/types/member.type";
import type {
  CreateMemberWithSchoolRequest,
  CreateAuth0Request,
  CreateAuth0Response,
  SchoolData,
} from "@/types/enrollment.type";

// Obtener datos de un miembro desde Firestore
export const fetchMemberAction = createAsyncThunk<
  Member,
  number,
  { rejectValue: string | string[] }
>("member/fetch", async (id, { rejectWithValue }) => {
  try {
    const member = await getMember(id);
    return member;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al obtener el miembro";
    return rejectWithValue(errorMessage);
  }
});

export const fetchMembersAction = createAsyncThunk(
  "members/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const members = await getMembers();
      return members;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al obtener los miembros";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener miembros por estado
export const fetchMembersByStatusAction = createAsyncThunk<
  Member[],
  "PENDING" | "APPROVED" | "REJECTED",
  { rejectValue: string }
>(
  "members/fetchByStatus",
  async (status: "PENDING" | "APPROVED" | "REJECTED", { rejectWithValue }) => {
    try {
      const members = await getMembersByStatus(status);
      return members;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al obtener los miembros";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener miembros con su respectiva rama
export const fetchMembersWithBranchAction = createAsyncThunk(
  "members/fetchWithBranch",
  async (_, { rejectWithValue }) => {
    try {
      const members = await getMembersWithBranch();
      return members;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al obtener los miembros";
      return rejectWithValue(errorMessage);
    }
  }
);

// Actualizar estado de un miembro
export const updateMemberStatusAction = createAsyncThunk<
  { message: string },
  { id: string | number; status: "PENDING" | "APPROVED" | "REJECTED" },
  { rejectValue: { error: string } }
>(
  "member/updateStatus",
  async (
    {
      id,
      status,
    }: { id: string | number; status: "PENDING" | "APPROVED" | "REJECTED" },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateMemberStatus(id, status);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al actualizar el estado del miembro";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Actualizar datos de un miembro en Firestore
export const updateMemberAction = createAsyncThunk<
  { message: string },
  { uid: string; updates: Partial<UpdateMember> },
  { rejectValue: { error: string } }
>("member/update", async ({ uid, updates }, { rejectWithValue }) => {
  try {
    const response = await updateMember(uid, updates);
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al actualizar el miembro";
    return rejectWithValue({ error: errorMessage });
  }
});

// Crear un nuevo miembro
export const createMemberAction = createAsyncThunk<
  { message: string; newMember?: Member },
  Member,
  { rejectValue: { error: string } }
>("member/create", async (memberData: Member, { rejectWithValue }) => {
  try {
    const response = await createMember(memberData);

    return {
      message: "Miembro creado exitosamente",
      newMember: response,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al crear el miembro";
    return rejectWithValue({ error: errorMessage });
  }
});

// Crear un miembro con datos escolares
export const createMemberWithSchoolDataAction = createAsyncThunk<
  { message: string; newMember?: Member },
  { memberData: CreateMemberWithSchoolRequest },
  { rejectValue: { error: string } }
>(
  "member/createWithSchoolData",
  async ({ memberData }, { rejectWithValue }) => {
    try {
      const fullMemberData = { ...memberData };
      const response = await createMemberWithSchool(fullMemberData);
      return {
        message: "Miembro creado exitosamente con datos escolares",
        newMember: response,
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al crear el miembro con datos escolares";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Crear miembro en Auth0
export const createMemberAuth0Action = createAsyncThunk<
  CreateAuth0Response,
  CreateAuth0Request,
  { rejectValue: { error: string } }
>(
  "member/createAuth0",
  async (data: CreateAuth0Request, { rejectWithValue }) => {
    try {
      const response = await createMemberAuth0(data);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al crear el miembro en Auth0";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Crear scout en Auth0
export const createScoutAuth0Action = createAsyncThunk<
  CreateAuth0Response,
  CreateAuth0Request,
  { rejectValue: { error: string } }
>(
  "member/createScoutAuth0",
  async (data: CreateAuth0Request, { rejectWithValue }) => {
    try {
      const response = await createScoutAuth0(data);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al crear el scout en Auth0";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Asignar subgrupo y sección a un miembro (backend endpoint separado)
export const assignSubgroupAndSectionAction = createAsyncThunk<
  { message: string },
  {
    memberId: number | string;
    subGroupId?: number | string;
    sectionId?: number | string;
  },
  { rejectValue: { error: string } }
>(
  "member/assignSubgroupAndSection",
  async ({ memberId, subGroupId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await assignSubgroupAndSection({
        memberId,
        subGroupId,
        sectionId,
      });
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage =
        errorData?.error || "Error al asignar subgrupo y sección";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Actualizar miembro enviando un DTO completo (usado cuando backend valida campos obligatorios)
export const updateMemberByDtoAction = createAsyncThunk<
  { message: string },
  { uid: string; memberDto: Record<string, unknown> },
  { rejectValue: { error: string } }
>("member/updateByDto", async ({ uid, memberDto }, { rejectWithValue }) => {
  try {
    const response = await updateMemberByDto(uid, memberDto);
    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al actualizar el miembro (DTO)";
    return rejectWithValue({ error: errorMessage });
  }
});

export const fetchSchoolDataMemberAction = createAsyncThunk<
  { memberId: number; schoolData: SchoolData },
  number,
  { rejectValue: string | string[] }
>("member/fetchSchoolData", async (id, { rejectWithValue }) => {
  try {
    const schoolData = await getSchoolDataByMemberId(id);
    return { memberId: id, schoolData };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al obtener los datos escolares del miembro";
    return rejectWithValue(errorMessage);
 }
});
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getMember,
  getMembers,
  updateMember,
  createMember,
  createMemberWithSchool
} from "@/api/membersApi";
import { validateClient } from "@/lib/zodUtils.ts";
import { updateMemberSchema } from "@/schemas/memberSchema";
import type { Member } from "@/types/member.type";
import type { CreateMemberWithSchoolRequest } from "@/types/enrollment.type";

// Obtener datos de un miembro desde Firestore
export const fetchMemberAction = createAsyncThunk<
  Member,
  string,
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

// Obtener datos de todos los miembros desde Firestore
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

// Actualizar datos de un miembro en Firestore
export const updateMemberAction = createAsyncThunk<
  { message: string },
  { uid: string; updates: Partial<Member> },
  { rejectValue: { error: string } }
>(
  "member/update",
  async (
    { uid, updates }: { uid: string; updates: Partial<Member> },
    { rejectWithValue }
  ) => {
    const validation = validateClient(updateMemberSchema, updates);
    if (!validation.success) {
      return rejectWithValue({ error: validation.error ?? "Datos inválidos" });
    }

    try {
      const response = await updateMember(uid, updates);
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al actualizar el miembro";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

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
>("member/createWithSchoolData", async ({ memberData}, { rejectWithValue }) => {
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
});

import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getMember,
  getMembers,
  updateMember,
  getMembersByStatus,
} from "../../api/membersApi";
import { validateClient } from "../../lib/zodUtils";
import { updateMemberSchema } from "@/schemas/memberSchema";
import type { Member } from "@/types/member.type";

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
  "members/fetchAll",
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

// Obtener datos de todos los miembros por estado
type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";
export const fetchMembersByStatusAction = createAsyncThunk<
  Member[],
  MemberStatus,
  { rejectValue: string }
>("members/fetchByStatus", async (status, { rejectWithValue }) => {
  try {
    const members = await getMembersByStatus(status);
    return members;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage =
      errorData?.error || "Error al obtener los miembros por estado";
    return rejectWithValue(errorMessage);
  }
});

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
      await updateMember(uid, updates);
      return { message: "Miembro actualizado correctamente" };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { error: string };
      const errorMessage = errorData?.error || "Error al actualizar el miembro";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

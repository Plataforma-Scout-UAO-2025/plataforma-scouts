import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {getMembersInChargeOf} from "@/api/guardiansApi";

export const fetchMembersInChargeAction = createAsyncThunk<
  Member[],
  number,
  { rejectValue: string | string[] }
>("member/fetch", async (id, { rejectWithValue }) => {
  try {
    const member = await getMembersInChargeOf(id);
    return member;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error: string };
    const errorMessage = errorData?.error || "Error al obtener el miembro";
    return rejectWithValue(errorMessage);
  }
});
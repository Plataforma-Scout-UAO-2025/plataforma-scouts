import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { MemberBasicInfo } from '@/types/guardian.type';
import { getMembersInChargeOf } from '@/api/guardiansApi';

export const fetchMembersInChargeAction = createAsyncThunk<
	MemberBasicInfo[],
	string | number,
	{ rejectValue: string | string[] }
>('member/fetchMembersInCharge', async (id, { rejectWithValue }) => {
	try {
		const member = await getMembersInChargeOf(id);
		return member;
	} catch (error: unknown) {
		const axiosError = error as AxiosError;
		const errorData = axiosError.response?.data as { error: string };
		const errorMessage = errorData?.error || 'Error al obtener los miembros';
		return rejectWithValue(errorMessage);
	}
});
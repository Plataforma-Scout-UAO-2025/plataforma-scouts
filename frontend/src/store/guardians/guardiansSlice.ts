import { createSlice } from "@reduxjs/toolkit";
import {
    fetchMembersInChargeAction
} from "./guardiansActions";
//import type { Member } from "@/types/member.type";
import type { MemberBasicInfo } from "@/types/guardian.type";

interface MembersState {
  members: MemberBasicInfo[];
  member?: MemberBasicInfo | null;
  loading: boolean;
  error: string | null;
  message: string;
}

const initialState: MembersState = {
  members: [],
  member: null,
  loading: false,
  error: null,
  message: "",
};

const guardiansSlice = createSlice({
  name: "guardians",
  initialState,
  reducers: {
    clearNotification(state) {
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMembersInChargeAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMembersInChargeAction.fulfilled, (state, action) => {
      state.loading = false;
      state.members = action.payload;
    });
    builder.addCase(fetchMembersInChargeAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    },
});

export const { clearNotification } = guardiansSlice.actions;
export default guardiansSlice.reducer;
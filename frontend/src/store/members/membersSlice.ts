import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMemberAction,
  fetchMembersAction,
  updateMemberAction,
  createMemberAction,
  createMemberWithSchoolDataAction
} from "./membersActions";
import type { Member } from "@/types/member.type";

interface MembersState {
  members: Member[];
  member?: Member | null;
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

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearNotification(state) {
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMemberAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMemberAction.fulfilled, (state, action) => {
      state.loading = false;
      state.member = action.payload;
    });
    builder.addCase(fetchMemberAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMembersAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMembersAction.fulfilled, (state, action) => {
      state.loading = false;
      state.members = action.payload as Member[];
    });
    builder.addCase(fetchMembersAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateMemberAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateMemberAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateMemberAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
    builder.addCase(createMemberAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createMemberAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (action.payload.newMember) {
        state.members.push(action.payload.newMember);
      }
    });
    builder.addCase(createMemberAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
    builder.addCase(createMemberWithSchoolDataAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createMemberWithSchoolDataAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (action.payload.newMember) {
        state.members.push(action.payload.newMember);
      }
    });
    builder.addCase(createMemberWithSchoolDataAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
  },
});

export const { clearNotification } = membersSlice.actions;
export default membersSlice.reducer;

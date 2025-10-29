import { createSlice } from "@reduxjs/toolkit";
import type { SchoolData } from "@/types/enrollment.type";
import {
  fetchMemberAction,
  fetchMembersAction,
  updateMemberAction,
  createMemberAction,
  createMemberWithSchoolDataAction,
  createMemberAuth0Action,
  createScoutAuth0Action,
  fetchMembersWithBranchAction,
  fetchMembersByStatusAction,
  fetchSchoolDataMemberAction,
  updateMemberStatusAction,
  changeAuth0UserRoleAction,
} from "./membersActions";

import type { Member } from "@/types/member.type";

interface MembersState {
  members: Member[];
  member?: Member | null;
  loading: boolean;
  error: string | null;
  message: string;
  schoolDataByMember: Record<number, SchoolData | null>;
  loadingSchoolData: boolean;
  errorSchoolData: string | null;
}

const initialState: MembersState = {
  members: [],
  member: null,
  loading: false,
  error: null,
  message: "",
  schoolDataByMember: {},
  loadingSchoolData: false,
  errorSchoolData: null,
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

    builder.addCase(fetchMembersWithBranchAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMembersWithBranchAction.fulfilled, (state, action) => {
      state.loading = false;
      state.members = action.payload as Member[];
    });
    builder.addCase(fetchMembersWithBranchAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
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
    builder.addCase(fetchMembersByStatusAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMembersByStatusAction.fulfilled, (state, action) => {
      state.loading = false;
      state.members = action.payload as Member[];
    });
    builder.addCase(fetchMembersByStatusAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateMemberStatusAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateMemberStatusAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateMemberStatusAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
    builder.addCase(createMemberAuth0Action.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createMemberAuth0Action.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "Usuario creado exitosamente en Auth0";
    });
    builder.addCase(createMemberAuth0Action.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
    builder.addCase(createScoutAuth0Action.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createScoutAuth0Action.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "Scout creado exitosamente en Auth0";
    });
    builder.addCase(createScoutAuth0Action.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
    builder.addCase(fetchSchoolDataMemberAction.pending, (state) => {
      state.loadingSchoolData = true;
      state.errorSchoolData = null;
    });
    builder.addCase(fetchSchoolDataMemberAction.fulfilled, (state, action) => {
      state.loadingSchoolData = false;
      state.schoolDataByMember[action.payload.memberId] = action.payload.schoolData;
    });
    builder.addCase(fetchSchoolDataMemberAction.rejected, (state, action) => {
      state.loadingSchoolData = false;
      state.errorSchoolData = action.payload as string;
    });
    builder.addCase(changeAuth0UserRoleAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(changeAuth0UserRoleAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "Rol cambiado exitosamente en Auth0";
    });
    builder.addCase(changeAuth0UserRoleAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
  },
});

export const { clearNotification } = membersSlice.actions;
export default membersSlice.reducer;
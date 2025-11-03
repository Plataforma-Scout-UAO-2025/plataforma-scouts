import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGroupAction,
  fetchGroupsAction,
  updateGroupAction,
  createGroupAction,
  fetchMembersCountByGroupAction,
  fetchTotalMembersCountAction,
  fetchActiveGroupsCountAction,
  fetchInactiveGroupsCountAction,
  fetchTopGroupsByMembersAction,
  createGroupMultipartAction,
  validateSlugAction,
} from "./groupsActions";
import type { GroupResponseDTO as Group, GroupMembersDTO, TopGroupByMembersDTO, GroupWithLeaderDTO } from "@/types/group.type";
interface GroupsState {
  groups: GroupWithLeaderDTO[];
  group?: Group | null;
  loading: boolean;
  error: string | null;
  message: string;
  memberCounts: GroupMembersDTO[];
  totalMembersCount: number;
  activeGroupsCount: number;
  inactiveGroupsCount: number;
  topGroupsByMembers: TopGroupByMembersDTO[];
  slugValidation: {
    loading: boolean;
    valid: boolean | null;
    message: string | null;
  };
}
const initialState: GroupsState = {
  groups: [],
  group: null,
  loading: false,
  error: null,
  message: "",
  memberCounts: [],
  totalMembersCount: 0,
  activeGroupsCount: 0,
  inactiveGroupsCount: 0,
  topGroupsByMembers: [],
  slugValidation: {
    loading: false,
    valid: null,
    message: null,
  },
};


const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearNotification(state) {
      state.message = "";
      state.error = null;
    },
    clearGroups(state) {
      state.groups = [];
      state.group = null;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGroupAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupAction.fulfilled, (state, action) => {
      state.loading = false;
      state.group = action.payload;
    });
    builder.addCase(fetchGroupAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchGroupsAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = action.payload as GroupWithLeaderDTO[];
    });
    builder.addCase(fetchGroupsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateGroupAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateGroupAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateGroupAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });

    builder.addCase(createGroupAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createGroupAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (action.payload.newGroup) {
        // Wrap the new group in GroupWithLeaderDTO structure
        state.groups.push({
          inChargeOf: null,
          group: action.payload.newGroup
        });
      }
    });
    builder.addCase(createGroupAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });

    // Crear grupo (multipart)
    builder.addCase(createGroupMultipartAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createGroupMultipartAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (action.payload.newGroup) {
        // Wrap the new group in GroupWithLeaderDTO structure
        state.groups.push({
          inChargeOf: null,
          group: action.payload.newGroup
        });
      }
    });
    builder.addCase(createGroupMultipartAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });

    // Stats de grupos
    builder.addCase(fetchMembersCountByGroupAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchMembersCountByGroupAction.fulfilled,
      (state, action) => {
        state.loading = false;
        state.memberCounts = action.payload as GroupMembersDTO[];
      }
    );
    builder.addCase(
      fetchMembersCountByGroupAction.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }
    );

    // Total de miembros
    builder.addCase(fetchTotalMembersCountAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTotalMembersCountAction.fulfilled, (state, action) => {
      state.loading = false;
      state.totalMembersCount = action.payload;
    });
    builder.addCase(fetchTotalMembersCountAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Grupos activos
    builder.addCase(fetchActiveGroupsCountAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActiveGroupsCountAction.fulfilled, (state, action) => {
      state.loading = false;
      state.activeGroupsCount = action.payload;
    });
    builder.addCase(fetchActiveGroupsCountAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Grupos inactivos
    builder.addCase(fetchInactiveGroupsCountAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInactiveGroupsCountAction.fulfilled, (state, action) => {
      state.loading = false;
      state.inactiveGroupsCount = action.payload;
    });
    builder.addCase(fetchInactiveGroupsCountAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Grupos con más miembros
    builder.addCase(fetchTopGroupsByMembersAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopGroupsByMembersAction.fulfilled, (state, action) => {
      state.loading = false;
      state.topGroupsByMembers = action.payload;
    });
    builder.addCase(fetchTopGroupsByMembersAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Validación de slug
    builder.addCase(validateSlugAction.pending, (state) => {
      state.slugValidation.loading = true;
      state.slugValidation.valid = null;
      state.slugValidation.message = null;
    });
    builder.addCase(validateSlugAction.fulfilled, (state, action) => {
      state.slugValidation.loading = false;
      state.slugValidation.valid = action.payload.valid;
      state.slugValidation.message = action.payload.message || action.payload.reason || null;
    });
    builder.addCase(validateSlugAction.rejected, (state, action) => {
      state.slugValidation.loading = false;
      state.slugValidation.valid = false;
      state.slugValidation.message = action.payload as string;
    });
  },
});export const { clearNotification, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;

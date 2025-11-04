import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGroupAction,
  fetchGroupsAction,
  fetchGroupsWithAdminsAction,
  updateGroupAction,
  createGroupAction,
  createGroupAdminAction,
  createGroupAdminWithConnectionAction,
  fetchMembersCountByGroupAction,
  fetchTotalMembersCountAction,
  fetchActiveGroupsCountAction,
  fetchInactiveGroupsCountAction,
  fetchTopGroupsByMembersAction,
} from "./groupsActions";
import type { GroupResponseDTO as Group, GroupMembersDTO, TopGroupByMembersDTO, GroupWithAdminBackendDTO } from "@/types/group.type";
interface GroupsState {
  groups: Group[];
  groupsWithAdmins: GroupWithAdminBackendDTO[];
  group?: Group | null;
  loading: boolean;
  error: string | null;
  message: string;
  memberCounts: GroupMembersDTO[];
  totalMembersCount: number;
  activeGroupsCount: number;
  inactiveGroupsCount: number;
  topGroupsByMembers: TopGroupByMembersDTO[];
}
const initialState: GroupsState = {
  groups: [],
  groupsWithAdmins: [],
  group: null,
  loading: false,
  error: null,
  message: "",
  memberCounts: [],
  totalMembersCount: 0,
  activeGroupsCount: 0,
  inactiveGroupsCount: 0,
  topGroupsByMembers: [],
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
      state.groups = action.payload as Group[];
    });
    builder.addCase(fetchGroupsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Grupos con administradores
    builder.addCase(fetchGroupsWithAdminsAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGroupsWithAdminsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.groupsWithAdmins = action.payload;
    });
    builder.addCase(fetchGroupsWithAdminsAction.rejected, (state, action) => {
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
        state.groups.push(action.payload.newGroup);
      }
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

    // Crear administrador de grupo
    builder.addCase(createGroupAdminAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createGroupAdminAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    builder.addCase(createGroupAdminAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });

    // Crear administrador de grupo con conexión específica
    builder.addCase(createGroupAdminWithConnectionAction.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createGroupAdminWithConnectionAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    builder.addCase(createGroupAdminWithConnectionAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error as string;
    });
  },
});export const { clearNotification, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;

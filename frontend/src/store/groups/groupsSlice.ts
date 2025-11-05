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
  validateGroupSlugAction,
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
  slugValidation: {
    isValidating: boolean;
    isAvailable: boolean | null;
    error: string | null;
  };
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
  slugValidation: {
    isValidating: false,
    isAvailable: null,
    error: null,
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
    resetSlugValidation(state) {
      state.slugValidation = {
        isValidating: false,
        isAvailable: null,
        error: null,
      };
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

    // Validar slug de grupo
    builder.addCase(validateGroupSlugAction.pending, (state) => {
      state.slugValidation.isValidating = true;
      state.slugValidation.error = null;
      state.slugValidation.isAvailable = null;
    });
    builder.addCase(validateGroupSlugAction.fulfilled, (state, action) => {
      state.slugValidation.isValidating = false;
      state.slugValidation.isAvailable = action.payload.valid;
      if (action.payload.valid === false && (action.payload.reason || action.payload.message)) {
        state.slugValidation.error = action.payload.reason || action.payload.message;
      } else {
        state.slugValidation.error = null;
      }
    });
    builder.addCase(validateGroupSlugAction.rejected, (state, action) => {
      state.slugValidation.isValidating = false;
      state.slugValidation.error = action.payload?.error || "Error al validar slug";
      state.slugValidation.isAvailable = false;
    });
  },
});
export const { clearNotification, clearGroups, resetSlugValidation } = groupsSlice.actions;
export default groupsSlice.reducer;

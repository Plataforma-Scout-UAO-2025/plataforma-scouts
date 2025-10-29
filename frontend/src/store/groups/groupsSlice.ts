import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGroupAction,
  fetchGroupsAction,
  updateGroupAction,
  createGroupAction,
} from "./groupsActions";
import type { GroupResponseDTO as Group } from "@/types/group.type";

interface GroupsState {
  groups: Group[];
  group?: Group | null;
  loading: boolean;
  error: string | null;
  message: string;
  memberCounts: [string, number][];
}
const initialState: GroupsState = {
  groups: [],
  group: null,
  loading: false,
  error: null,
  message: "",
  memberCounts: [],
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
  },
});

export const { clearNotification, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;

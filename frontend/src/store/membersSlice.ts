import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Member,
  MemberFilters,
  MemberStats,
} from "../app/routes/adminGrupal/Miembros/types/member.type";
import { membersService } from "../api/services/members.service";

// Tipo del estado
interface MembersState {
  items: Member[];
  selectedItem: Member | null;
  loading: boolean;
  error: string | null;
  message: string;
  stats: MemberStats;
}

// Estado inicial
const initialState: MembersState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  message: "",
  stats: {
    totalMembers: 0,
    activeMembers: 0,
    membersByBranch: {},
    membersByCity: {},
  },
};

// Thunks asincrónicos
export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
  async (filters?: MemberFilters) => {
    const response = await membersService.getAll(filters);
    return response;
  }
);

export const fetchMemberById = createAsyncThunk(
  "members/fetchMemberById",
  async (id: string) => {
    const response = await membersService.getById(id);
    return response;
  }
);

export const createMember = createAsyncThunk(
  "members/createMember",
  async (memberData: Omit<Member, "id" | "createdAt">) => {
    const response = await membersService.create(memberData);
    return response;
  }
);

export const updateMember = createAsyncThunk(
  "members/updateMember",
  async ({ id, memberData }: { id: string; memberData: Partial<Member> }) => {
    const response = await membersService.update(id, memberData);
    return response;
  }
);

export const deleteMember = createAsyncThunk(
  "members/deleteMember",
  async (id: string) => {
    await membersService.delete(id);
    return id;
  }
);

export const fetchMemberStats = createAsyncThunk(
  "members/fetchMemberStats",
  async () => {
    const response = await membersService.getStats();
    return response;
  }
);

// Slice
const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearNotification: (state) => {
      state.message = "";
      state.error = null;
    },
    clearSelected: (state) => {
      state.selectedItem = null;
    },
    setSelectedMember: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.message = "Miembros cargados exitosamente";
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al cargar los miembros";
      })

      // Fetch Member By Id
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.selectedItem = action.payload.data;
      })

      // Create Member
      .addCase(createMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.data);
        state.message = "Miembro creado exitosamente";
      })
      .addCase(createMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al crear el miembro";
      })

      // Update Member
      .addCase(updateMember.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.member_id === action.payload.data.member_id
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (state.selectedItem?.member_id === action.payload.data.member_id) {
          state.selectedItem = action.payload.data;
        }
        state.message = "Miembro actualizado exitosamente";
      })

      // Delete Member
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.member_id !== action.payload
        );
        if (state.selectedItem?.member_id === action.payload) {
          state.selectedItem = null;
        }
        state.message = "Miembro eliminado exitosamente";
      })

      // Fetch Stats
      .addCase(fetchMemberStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearNotification, clearSelected, setSelectedMember } =
  membersSlice.actions;
export default membersSlice.reducer;

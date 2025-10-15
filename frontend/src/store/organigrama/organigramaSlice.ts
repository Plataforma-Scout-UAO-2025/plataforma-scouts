import { createSlice } from "@reduxjs/toolkit";
import { fetchSectionsAction, fetchSectionWithSubgroupsAction, fetchMembersBySubgroupAction } from "./organigramaActions";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { Member } from "@/types/member.type";

// Algunos endpoints devuelven campos en snake_case (por ejemplo subgroup_id).
// Definimos un tipo local que cubre ambas formas para evitar usar `any`.
type MemberLike = Member & { subgroup_id?: number };

interface OrganigramaState {
  sections: Section[];
  currentSection?: { section: Section; subgroups: Subgroup[] } | null;
  membersBySubgroup: Record<string, Member[]>;
  loading: boolean;
  error: string | null;
}

const initialState: OrganigramaState = {
  sections: [],
  currentSection: null,
  membersBySubgroup: {},
  loading: false,
  error: null,
};

const organigramaSlice = createSlice({
  name: "organigrama",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSectionsAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSectionsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.sections = action.payload as Section[];
    });
    builder.addCase(fetchSectionsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchSectionWithSubgroupsAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSectionWithSubgroupsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSection = action.payload;
    });
    builder.addCase(fetchSectionWithSubgroupsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchMembersBySubgroupAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMembersBySubgroupAction.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload as MemberLike[];
      if (payload && payload.length > 0) {
        const subgroupId = payload[0].subgroup_id ?? payload[0].subgroup_id ?? null;
        if (subgroupId != null) {
          // Guardamos usando el ID numérico descubierto
          state.membersBySubgroup[subgroupId] = payload as Member[];
        }
      }
    });
    builder.addCase(fetchMembersBySubgroupAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default organigramaSlice.reducer;
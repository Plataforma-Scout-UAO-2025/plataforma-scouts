import { createSlice } from "@reduxjs/toolkit";
import { fetchGroupAction, fetchSectionsAction, fetchSectionWithSubgroupsAction, fetchSubgroupMembersAction, setIconAction, deleteIconAction, setPhotoPrincipalAction, deletePhotoPrincipalAction, addGalleryImageAction, replaceGalleryImageAction } from "./organigramaActions";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { GroupResponseDTO } from "@/types/group.type";
import type { Member } from "@/types/member.type";

interface OrganigramaState {
  group: GroupResponseDTO | null;
  sections: Section[];
  currentSection?: { section: Section; subgroups: Subgroup[] } | null;
  subgroupMembers: {
    [subgroupId: number]: {
      members: Member[];
      loading: boolean;
      error: string | null;
    };
  };
  loading: boolean;
  error: string | null;
}

const initialState: OrganigramaState = {
  group: null,
  sections: [],
  currentSection: null,
  subgroupMembers: {},
  loading: false,
  error: null,
};

const organigramaSlice = createSlice({
  name: "organigrama",
  initialState,
  reducers: {},
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



    builder.addCase(setIconAction.fulfilled, (state, action) => {
      const { sectionId, objectId } = action.payload;
      const section = state.sections.find(s => s.sectionId === sectionId);
      if (section) {
        section.iconObjectId = objectId;
      }
      if (state.currentSection?.section.sectionId === sectionId) {
        state.currentSection.section.iconObjectId = objectId;
      }
    });

    builder.addCase(deleteIconAction.fulfilled, (state, action) => {
      const { sectionId } = action.payload;
      const section = state.sections.find(s => s.sectionId === sectionId);
      if (section) {
        section.iconObjectId = null;
        section.iconUrl = null;
      }
      if (state.currentSection?.section.sectionId === sectionId) {
        state.currentSection.section.iconObjectId = null;
        state.currentSection.section.iconUrl = null;
      }
    });

    builder.addCase(setPhotoPrincipalAction.fulfilled, (state, action) => {
      const { sectionId, objectId } = action.payload;
      const section = state.sections.find(s => s.sectionId === sectionId);
      if (section) {
        section.photoPrincipal = objectId;
      }
      if (state.currentSection?.section.sectionId === sectionId) {
        state.currentSection.section.photoPrincipal = objectId;
      }
    });

    builder.addCase(deletePhotoPrincipalAction.fulfilled, (state, action) => {
      const { sectionId } = action.payload;
      const section = state.sections.find(s => s.sectionId === sectionId);
      if (section) {
        section.photoPrincipal = null;
      }
      if (state.currentSection?.section.sectionId === sectionId) {
        state.currentSection.section.photoPrincipal = null;
      }
    });

    builder.addCase(addGalleryImageAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addGalleryImageAction.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(addGalleryImageAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(replaceGalleryImageAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(replaceGalleryImageAction.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(replaceGalleryImageAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Subgroup members actions
    builder.addCase(fetchSubgroupMembersAction.pending, (state, action) => {
      const subgroupId = action.meta.arg;
      if (!state.subgroupMembers[subgroupId]) {
        state.subgroupMembers[subgroupId] = {
          members: [],
          loading: false,
          error: null,
        };
      }
      state.subgroupMembers[subgroupId].loading = true;
      state.subgroupMembers[subgroupId].error = null;
    });
    builder.addCase(fetchSubgroupMembersAction.fulfilled, (state, action) => {
      const { subgroupId, members } = action.payload;
      state.subgroupMembers[subgroupId] = {
        members: members as Member[],
        loading: false,
        error: null,
      };
    });
    builder.addCase(fetchSubgroupMembersAction.rejected, (state, action) => {
      const subgroupId = action.meta.arg;
      if (!state.subgroupMembers[subgroupId]) {
        state.subgroupMembers[subgroupId] = {
          members: [],
          loading: false,
          error: null,
        };
      }
      state.subgroupMembers[subgroupId].loading = false;
      state.subgroupMembers[subgroupId].error = action.payload as string;
    });
  },
});

// Selectors
export const selectSubgroupMembers = (subgroupId: number) => (state: { organigrama: OrganigramaState }) => {
  return state.organigrama.subgroupMembers[subgroupId] || { members: [], loading: false, error: null };
};

export const selectAllSubgroupMembers = (state: { organigrama: OrganigramaState }) => {
  return state.organigrama.subgroupMembers;
};

export default organigramaSlice.reducer;
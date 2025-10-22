import { createSlice } from "@reduxjs/toolkit";
import { fetchSectionsAction, fetchSectionWithSubgroupsAction, setIconAction, deleteIconAction, setPhotoPrincipalAction, deletePhotoPrincipalAction, addGalleryImageAction, replaceGalleryImageAction } from "./organigramaActions";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";

interface OrganigramaState {
  sections: Section[];
  currentSection?: { section: Section; subgroups: Subgroup[] } | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganigramaState = {
  sections: [],
  currentSection: null,
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

    // Gallery actions - no state updates needed as gallery is not in Section type
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
  },
});

export default organigramaSlice.reducer;
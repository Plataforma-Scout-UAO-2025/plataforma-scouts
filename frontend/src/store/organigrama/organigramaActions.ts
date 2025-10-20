import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getSections, getSectionWithSubgroups, getMembersBySubgroup, setPhotoPrincipal as setPhotoPrincipalApi, deletePhotoPrincipal as deletePhotoPrincipalApi } from '@/api/organigramaApi';
import { setIcon, deleteIcon } from '@/app/routes/organigrama/organigramaRamas_Subramas/services/icon.service';
import { addGalleryImage, replaceGalleryImage } from '@/app/routes/organigrama/organigramaRamas_Subramas/services/gallery.service';

// Fetch sections for tenant/group
export const fetchSectionsAction = createAsyncThunk("organigrama/fetchSections", async ({ tenantId, groupSlug }: { tenantId: string; groupSlug: string }, { rejectWithValue }) => {
  try {
    const data = await getSections(tenantId, groupSlug);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al obtener secciones";
    return rejectWithValue(message);
  }
});

export const fetchSectionWithSubgroupsAction = createAsyncThunk("organigrama/fetchSectionWithSubgroups", async ({ sectionId, tenantId, groupSlug }: { sectionId: number | string; tenantId: string; groupSlug: string }, { rejectWithValue }) => {
  try {
    const data = await getSectionWithSubgroups(sectionId, tenantId, groupSlug);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al obtener la sección con subgrupos";
    return rejectWithValue(message);
  }
});

export const fetchMembersBySubgroupAction = createAsyncThunk("organigrama/fetchMembersBySubgroup", async (subgroupId: number, { rejectWithValue }) => {
  try {
    const data = await getMembersBySubgroup(subgroupId);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al obtener miembros por subgrupo";
    return rejectWithValue(message);
  }
});

export const setIconAction = createAsyncThunk("organigrama/setIcon", async ({ tenantId, groupSlug, sectionId, objectId }: { tenantId: string; groupSlug: string; sectionId: string; objectId: string }, { rejectWithValue }) => {
  try {
    await setIcon(tenantId, groupSlug, sectionId, objectId);
    return { sectionId, objectId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al establecer ícono";
    return rejectWithValue(message);
  }
});

export const deleteIconAction = createAsyncThunk("organigrama/deleteIcon", async ({ tenantId, groupSlug, sectionId }: { tenantId: string; groupSlug: string; sectionId: string }, { rejectWithValue }) => {
  try {
    await deleteIcon(tenantId, groupSlug, sectionId);
    return { sectionId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al eliminar ícono";
    return rejectWithValue(message);
  }
});

export const setPhotoPrincipalAction = createAsyncThunk("organigrama/setPhotoPrincipal", async ({ tenantId, groupSlug, sectionId, objectId }: { tenantId: string; groupSlug: string; sectionId: string; objectId: string }, { rejectWithValue }) => {
  try {
    await setPhotoPrincipalApi(sectionId, { objectId }, tenantId, groupSlug);
    return { sectionId, objectId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al establecer foto principal";
    return rejectWithValue(message);
  }
});

export const deletePhotoPrincipalAction = createAsyncThunk("organigrama/deletePhotoPrincipal", async ({ tenantId, groupSlug, sectionId }: { tenantId: string; groupSlug: string; sectionId: string }, { rejectWithValue }) => {
  try {
    await deletePhotoPrincipalApi(sectionId, tenantId, groupSlug);
    return { sectionId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al eliminar foto principal";
    return rejectWithValue(message);
  }
});

export const addGalleryImageAction = createAsyncThunk("organigrama/addGalleryImage", async ({ tenantId, groupSlug, sectionId, file }: { tenantId: string; groupSlug: string; sectionId: string; file: File }, { rejectWithValue }) => {
  try {
    const url = await addGalleryImage(tenantId, groupSlug, sectionId, file);
    return { sectionId, url };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al agregar imagen a galería";
    return rejectWithValue(message);
  }
});

export const replaceGalleryImageAction = createAsyncThunk("organigrama/replaceGalleryImage", async ({ tenantId, groupSlug, sectionId, targetImageUuid, newFile }: { tenantId: string; groupSlug: string; sectionId: string; targetImageUuid: string; newFile: File }, { rejectWithValue }) => {
  try {
    const url = await replaceGalleryImage(tenantId, groupSlug, sectionId, targetImageUuid, newFile);
    return { sectionId, url };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al reemplazar imagen en galería";
    return rejectWithValue(message);
  }
});
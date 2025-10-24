import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getSections, getSectionWithSubgroups, setPhotoPrincipal as setPhotoPrincipalApi, deletePhotoPrincipal as deletePhotoPrincipalApi, setSubgroupPhotoPrincipal, deleteSubgroupPhotoPrincipal, getGroupBySlug, getMembersBySubgroup } from '@/api/organigramaApi';
import { setIcon, deleteIcon } from '@/app/routes/organigrama/organigramaRamas_Subramas/services/icon.service';
import { addGalleryImage, replaceGalleryImage } from '@/app/routes/organigrama/organigramaRamas_Subramas/services/gallery.service';

// Fetch group information
export const fetchGroupAction = createAsyncThunk("organigrama/fetchGroup", async ({ tenantId, groupSlug }: { tenantId: string; groupSlug: string }, { rejectWithValue }) => {
  try {
    const data = await getGroupBySlug(tenantId, groupSlug);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al obtener información del grupo";
    return rejectWithValue(message);
  }
});

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

export const setSubgroupPhotoPrincipalAction = createAsyncThunk("organigrama/setSubgroupPhotoPrincipal", async ({ tenantId, groupSlug, sectionId, subgroupId, objectId }: { tenantId: string; groupSlug: string; sectionId: string; subgroupId: string; objectId: string }, { rejectWithValue }) => {
  try {
    await setSubgroupPhotoPrincipal(sectionId, subgroupId, { objectId }, tenantId, groupSlug);
    return { sectionId, subgroupId, objectId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al establecer foto principal de subgrupo";
    return rejectWithValue(message);
  }
});

export const deleteSubgroupPhotoPrincipalAction = createAsyncThunk("organigrama/deleteSubgroupPhotoPrincipal", async ({ tenantId, groupSlug, sectionId, subgroupId }: { tenantId: string; groupSlug: string; sectionId: string; subgroupId: string }, { rejectWithValue }) => {
  try {
    await deleteSubgroupPhotoPrincipal(sectionId, subgroupId, tenantId, groupSlug);
    return { sectionId, subgroupId };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al eliminar foto principal de subgrupo";
    return rejectWithValue(message);
  }
});

// Fetch members by subgroup
export const fetchSubgroupMembersAction = createAsyncThunk("organigrama/fetchSubgroupMembers", async (subgroupId: number, { rejectWithValue }) => {
  try {
    const members = await getMembersBySubgroup(subgroupId);
    return { subgroupId, members };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as { error?: string };
    const message = errorData?.error || "Error al obtener miembros del subgrupo";
    return rejectWithValue(message);
  }
});
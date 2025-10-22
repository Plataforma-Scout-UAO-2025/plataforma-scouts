import api from "./axios";
import type { TenantDTO, GroupResponseDTO } from "@/types/group.type";
import type { Section } from '@/types/section-simple.type';
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { IconSetPayload } from "../app/routes/organigrama/organigramaRamas_Subramas/services/icon.service";

const mapBackendSectionToSection = (backendSection: Record<string, unknown>): Section => {
  const section = backendSection as unknown as Section;
  return {
    ...section,
    id: backendSection.sectionId as number || backendSection.section_id as number,
    sectionId: backendSection.sectionId as number | string || backendSection.section_id as number | string,
    photoPrincipal: backendSection.photoPrincipalId as string | null || backendSection.photoPrincipal as string | null,
  };
};

const mapBackendSubgroupToSubgroup = (backendSubgroup: Record<string, unknown>): Subgroup => {
  const subgroup = backendSubgroup as unknown as Subgroup;
  return {
    ...subgroup,
    id: backendSubgroup.subgroupId as number || backendSubgroup.subgroup_id as number,
    subgroupId: backendSubgroup.subgroupId as number || backendSubgroup.subgroup_id as number,
  };
};

// Tenants y grupos

// Obtiene la lista de todos los tenants disponibles en el sistema
export const getAllTenants = async () => {
  const response = await api.get<TenantDTO[]>("/tenants");
  return response.data;
};

// Obtiene los detalles de un tenant específico por su ID
export const getTenantById = async (tenantId: string) => {
  const response = await api.get<TenantDTO>(`/tenants/${tenantId}`);
  return response.data;
};

// Obtiene todos los grupos asociados a un tenant específico
export const getGroupsByTenant = async (tenantId: string, signal?: AbortSignal) => {
  const config = signal ? { signal } : undefined;
  const response = await api.get<GroupResponseDTO[]>(`/tenants/${tenantId}/groups`, config);
  return response.data;
};

// Obtiene los detalles de un grupo específico por su slug dentro de un tenant
export const getGroupBySlug = async (tenantId: string, groupSlug: string) => {
  const response = await api.get<GroupResponseDTO>(`/tenants/${tenantId}/groups/${groupSlug}`);
  return response.data;
};

// Secciones

// Obtiene todas las secciones (ramas) de un grupo específico
export const getSections = async (tenantId: string, groupSlug: string) => {
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/sections`);
  return response.data.map(mapBackendSectionToSection);
};

// Obtiene los detalles de una sección específica por su ID
export const getSection = async (sectionId: string | number, tenantId: string, groupSlug: string) => {
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}`);
  return mapBackendSectionToSection(response.data);
};

// Obtiene una sección junto con todos sus subgrupos asociados
export const getSectionWithSubgroups = async (sectionId: string | number, tenantId: string, groupSlug: string, signal?: AbortSignal) => {
  const config = signal ? { signal } : undefined;
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/with-subgroups`, config);
  return {
    section: mapBackendSectionToSection(response.data.section || response.data),
    subgroups: (response.data.subgroups || []).map(mapBackendSubgroupToSubgroup),
  };
};

// Crea una nueva sección en un grupo específico
export const createSection = async (payload: Omit<Section, 'id' | 'sectionId' | 'groupId' | 'createdAt' | 'updatedAt'>, tenantId: string, groupSlug: string) => {
  const response = await api.post(`/tenants/${tenantId}/groups/${groupSlug}/sections`, payload);
  return mapBackendSectionToSection(response.data);
};

// Actualiza los datos de una sección existente
export const updateSection = async (sectionId: string | number, payload: Partial<Section>, tenantId: string, groupSlug: string) => {
  const response = await api.put(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}`, payload);
  return mapBackendSectionToSection(response.data);
};

// Elimina una sección del sistema
export const deleteSection = async (sectionId: string | number, tenantId: string, groupSlug: string) => {
  await api.delete(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}`);
};

// Subgrupos

// Obtiene todos los subgrupos de una sección específica
export const getSubgroups = async (sectionId: string | number, tenantId: string, groupSlug: string) => {
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups`);
  return response.data.map(mapBackendSubgroupToSubgroup);
};

// Obtiene los detalles de un subgrupo específico por su ID dentro de una sección
export const getSubgroup = async (sectionId: string | number, subgroupId: string | number, tenantId: string, groupSlug: string) => {
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
  return mapBackendSubgroupToSubgroup(response.data);
};

// Crea un nuevo subgrupo dentro de una sección
export const createSubgroup = async (sectionId: string | number, payload: Omit<Subgroup, 'id' | 'subgroupId' | 'tenantId' | 'groupId' | 'sectionId' | 'createdAt' | 'updatedAt'>, tenantId: string, groupSlug: string) => {
  const response = await api.post(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups`, payload);
  return mapBackendSubgroupToSubgroup(response.data);
};

// Actualiza los datos de un subgrupo existente
export const updateSubgroup = async (sectionId: string | number, subgroupId: string | number, payload: Partial<Subgroup>, tenantId: string, groupSlug: string) => {
  const response = await api.put(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`, payload);
  return mapBackendSubgroupToSubgroup(response.data);
};

// Elimina un subgrupo del sistema
export const deleteSubgroup = async (sectionId: string | number, subgroupId: string | number, tenantId: string, groupSlug: string) => {
  await api.delete(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
};

// Operaciones de galería

// Sube una imagen a la galería de una sección
export const uploadToGallery = async (sectionId: string | number, file: FormData, tenantId: string, groupSlug: string) => {
  const response = await api.post(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/gallery`, file, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
};

// Actualiza la galería de una sección (agregar/quitar imágenes)
export const patchGallery = async (sectionId: string | number, payload: Record<string, unknown>, tenantId: string, groupSlug: string) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/gallery`, payload);
  return response.data;
};

// Establece el ícono de una sección
export const setIcon = async (sectionId: string | number, payload: IconSetPayload, tenantId: string, groupSlug: string) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/icon`, payload);
  return response.data;
};

// Elimina el ícono de una sección
export const deleteIcon = async (sectionId: string | number, tenantId: string, groupSlug: string) => {
  await api.delete(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/icon`);
};

// Establece la foto principal de una sección
export const setPhotoPrincipal = async (sectionId: string | number, payload: Record<string, unknown>, tenantId: string, groupSlug: string) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/photo-principal`, payload);
  return response.data;
};

// Elimina la foto principal de una sección
export const deletePhotoPrincipal = async (sectionId: string | number, tenantId: string, groupSlug: string) => {
  const response = await api.delete(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/photo-principal`);
  return response.data;
};

// Operaciones de galería de subgrupos

// Sube una foto a la galería de un subgrupo
export const uploadSubgroupPhoto = async (sectionId: string | number, subgroupId: string | number, file: FormData, tenantId: string, groupSlug: string) => {
  const response = await api.post(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/gallery`, file, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data;
};

// Actualiza la galería de un subgrupo
export const patchSubgroupGallery = async (sectionId: string | number, subgroupId: string | number, payload: Record<string, unknown>, tenantId: string, groupSlug: string) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/gallery`, payload);
  return response.data;
};

// Establece la foto principal de un subgrupo
export const setSubgroupPhotoPrincipal = async (sectionId: string | number, subgroupId: string | number, payload: Record<string, unknown>, tenantId: string, groupSlug: string) => {
  const response = await api.patch(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`, payload);
  return response.data;
};

// Elimina la foto principal de un subgrupo
export const deleteSubgroupPhotoPrincipal = async (sectionId: string | number, subgroupId: string | number, tenantId: string, groupSlug: string) => {
  await api.delete(`/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`);
};

// Elimina una imagen específica de la galería de una sección por su objectId
export const deleteGalleryImageById = async (
  sectionId: string | number,
  objectId: string,
  tenantId: string,
  groupSlug: string,
  deleteFromStorage = false
) => {
  const endpoint = `/tenants/${tenantId}/groups/${groupSlug}/sections/${sectionId}/gallery/${objectId}?deleteFromStorage=${deleteFromStorage ? 'true' : 'false'}`;
  const response = await api.delete(endpoint);
  return response.data ?? null;
};

// Miembros por subgrupo

// Obtiene la lista de miembros pertenecientes a un subgrupo específico
export const getMembersBySubgroup = async (subgroupId: number) => {
  // Primero intentamos con 'id' (comportamiento principal). Solo usamos fallback si esta llamada falla.
  try {
    const response = await api.get(`/members/list_members_by_subgroup`, { params: { id: subgroupId } });
    const data = response.data as unknown;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as any).members)) return (data as any).members;
    return [] as any[];
  } catch (err1) {
    // Fallback: algunos backends usan 'subgroup_id'
    try {
      const response2 = await api.get(`/members/list_members_by_subgroup`, { params: { subgroup_id: subgroupId } });
      const data2 = response2.data as unknown;
      if (Array.isArray(data2)) return data2;
      if (data2 && typeof data2 === 'object' && Array.isArray((data2 as any).members)) return (data2 as any).members;
      return [] as any[];
    } catch (err2) {
      console.warn('getMembersBySubgroup failed', { subgroupId, err1, err2 });
      return [] as any[];
    }
  }
};

// Obtiene un subgrupo junto con su sección padre
export const getSubgroupWithSection = async (subgroupId: string | number, tenantId: string, groupSlug: string) => {
  const response = await api.get(`/tenants/${tenantId}/groups/${groupSlug}/subgroups/${subgroupId}`);
  const subgroup = mapBackendSubgroupToSubgroup(response.data);
  
  const section = await getSection(subgroup.sectionId, tenantId, groupSlug);
  
  return {
    subgroup,
    section
  };
};
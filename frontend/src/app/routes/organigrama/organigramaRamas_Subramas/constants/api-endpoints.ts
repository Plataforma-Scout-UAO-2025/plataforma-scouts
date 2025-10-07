// Configuración de endpoints PATCH específicos
export const PATCH_ENDPOINTS = {
  ICON: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`,
  MAIN_IMAGE: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/photo-principal`,
  GALLERY: (tenantSlug: string, groupSlug: string, sectionId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery`,
  SUBRAMA_MAIN_IMAGE: (tenantSlug: string, groupSlug: string, sectionId: string, subgroupId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`,
  SUBRAMA_GALLERY: (tenantSlug: string, groupSlug: string, sectionId: string, subgroupId: string) => 
    `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/gallery`
} as const;
import api from "./axios";

// ===================================
// 🔧 HELPER FUNCTIONS
// ===================================

/**
 * Obtiene configuración de tenant y group de variables de entorno
 */
const getTenantConfig = () => {
  const tenantSlug = import.meta.env.VITE_TENANT_SLUG;
  const groupSlug = import.meta.env.VITE_GROUP_SLUG;
  
  if (!tenantSlug || tenantSlug === 'tu-tenant-aqui') {
    throw new Error('VITE_TENANT_SLUG no está configurado. Revisa tu archivo .env.local');
  }
  
  if (!groupSlug || groupSlug === 'tu-grupo-scout-aqui') {
    throw new Error('VITE_GROUP_SLUG no está configurado. Revisa tu archivo .env.local');
  }
  
  return { tenantSlug, groupSlug };
};

/**
 * Construye URL para endpoints que requieren tenant y group
 */
const buildTenantGroupUrl = (endpoint: string): string => {
  const { tenantSlug, groupSlug } = getTenantConfig();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `/tenants/${tenantSlug}/groups/${groupSlug}/${cleanEndpoint}`;
};

/**
 * Construye URL para endpoints que solo requieren tenant
 */
const buildTenantUrl = (endpoint: string): string => {
  const { tenantSlug } = getTenantConfig();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `/tenants/${tenantSlug}/${cleanEndpoint}`;
};

// ===================================
// 🎯 TIPOS DE DATOS
// ===================================

// Define tipos para el organigrama
export interface OrganigramaNode {
  id: string;
  name: string;
  description?: string;
  type: 'tenant' | 'group' | 'section' | 'subgroup';
  parentId?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

// Tipos para Tenants
export interface Tenant {
  tenantId: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  tenantId: string;
  slug: string;
  status: string;
}

// Tipos para Groups
export interface Group {
  groupId: number;
  tenantId: string;
  slug: string;
  name: string;
  district: string;
  identifierNumber: string;
  address: string;
  phone: string;
  email: string;
  foundedIn: string;
  motto: string;
  mission: string;
  vision: string;
  history: string;
  logoObjectId: string;
  scarfObjectId: string;
  socialLinks: Record<string, unknown>;
  config: Record<string, unknown>;
  isActive: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupRequest {
  groupId: number;
  tenantId: string;
  slug: string;
  name: string;
  district: string;
  identifierNumber: string;
  address: string;
  phone: string;
  email: string;
  foundedIn: string;
  motto: string;
  mission: string;
  vision: string;
  history: string;
  logoObjectId: string;
  scarfObjectId: string;
  socialLinks: Record<string, unknown>;
  config: Record<string, unknown>;
  isActive: boolean;
  status: string;
}

// Tipos para Sections (Secciones/Ramas)
export interface Section {
  sectionId: number;
  tenantId: string;
  groupId: number;
  name: string;
  description: string;
  iconObjectId: string;
  photoPrincipal: string;
  galleryObjectIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  sectionId: number;
  tenantId: string;
  groupId: number;
  name: string;
  description: string;
  iconObjectId: string;
  photoPrincipal: string;
  galleryObjectIds: string[];
}

export interface SectionWithSubgroups extends Section {
  subgroups: Subgroup[];
}

// Tipos para Subgroups
export interface Subgroup {
  subgroupId: number;
  tenantId: string;
  groupId: number;
  sectionId: number;
  name: string;
  description: string;
  photoPrincipal: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubgroupRequest {
  subgroupId: number;
  tenantId: string;
  groupId: number;
  sectionId: number;
  name: string;
  description: string;
  photoPrincipal: string;
  isActive: boolean;
}

// Tipos para operaciones de galería
export interface GalleryOperation {
  op: "replace" | "add" | "remove";
  targetUuid: string;
  newValue?: string;
}

export interface GalleryOperationRequest {
  operations: GalleryOperation[];
}

// Tipos para Storage
export interface UploadResponse {
  objectId: string;
}

export interface FileUrlResponse {
  fileName: string;
  bucket: string;
  fileUrl: string;
}

// ==================== FUNCIONES PRINCIPALES DEL ORGANIGRAMA ====================

// Obtener el organigrama completo
export const getOrganigrama = async () => {
  const response = await api.get("/organigrama");
  return response.data;
};

// Obtener un nodo específico del organigrama
export const getOrganigramaNode = async (id: string) => {
  const response = await api.get(`/organigrama/${id}`);
  return response.data;
};

// Crear un nuevo nodo del organigrama
export const createOrganigramaNode = async (node: Partial<OrganigramaNode>) => {
  const response = await api.post("/organigrama", node);
  return response.data;
};

// Actualizar un nodo del organigrama
export const updateOrganigramaNode = async (id: string, updates: Partial<OrganigramaNode>) => {
  const response = await api.put(`/organigrama/${id}`, updates);
  return response.data;
};

// Eliminar un nodo del organigrama
export const deleteOrganigramaNode = async (id: string) => {
  const response = await api.delete(`/organigrama/${id}`);
  return response.data;
};

// ==================== FUNCIONES API - TENANTS ====================

// GET /tenants
export const getAllTenants = async (): Promise<Tenant[]> => {
  const response = await api.get("/tenants");
  return response.data;
};

// GET /tenants/{tenantSlug}
export const getTenantBySlug = async (tenantSlug: string): Promise<Tenant> => {
  const response = await api.get(`/tenants/${tenantSlug}`);
  return response.data;
};

// POST /tenants
export const createTenant = async (tenant: CreateTenantRequest): Promise<Tenant> => {
  const response = await api.post("/tenants", tenant);
  return response.data;
};

// PUT /tenants/{tenantSlug}
export const updateTenant = async (tenantSlug: string, tenant: CreateTenantRequest): Promise<Tenant> => {
  const response = await api.put(`/tenants/${tenantSlug}`, tenant);
  return response.data;
};

// DELETE /tenants/{tenantSlug}
export const deleteTenant = async (tenantSlug: string): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}`);
};

// ==================== FUNCIONES API - GROUPS ====================

// GET /tenants/{tenantSlug}/groups
export const getAllGroups = async (tenantSlug?: string): Promise<Group[]> => {
  const url = tenantSlug ? `/tenants/${tenantSlug}/groups` : buildTenantUrl('groups');
  const response = await api.get(url);
  return response.data;
};

// GET /tenants/{tenantSlug}/groups/{groupSlug}
export const getGroupBySlug = async (tenantSlug?: string, groupSlug?: string): Promise<Group> => {
  const url = (tenantSlug && groupSlug) 
    ? `/tenants/${tenantSlug}/groups/${groupSlug}` 
    : buildTenantGroupUrl('');
  const response = await api.get(url);
  return response.data;
};

// POST /tenants/{tenantSlug}/groups
export const createGroup = async (tenantSlug: string, group: CreateGroupRequest): Promise<Group> => {
  const response = await api.post(`/tenants/${tenantSlug}/groups`, group);
  return response.data;
};

// PUT /tenants/{tenantSlug}/groups/{groupSlug}
export const updateGroup = async (tenantSlug: string, groupSlug: string, group: CreateGroupRequest): Promise<Group> => {
  const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}`, group);
  return response.data;
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}
export const deleteGroup = async (tenantSlug: string, groupSlug: string): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}`);
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/logo
export const updateGroupLogo = async (tenantSlug: string, groupSlug: string, objectId: string): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/logo`, { objectId });
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/scarf
export const updateGroupScarf = async (tenantSlug: string, groupSlug: string, objectId: string): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/scarf`, { objectId });
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/logo
export const deleteGroupLogo = async (tenantSlug: string, groupSlug: string): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/logo`);
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/scarf
export const deleteGroupScarf = async (tenantSlug: string, groupSlug: string): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/scarf`);
};

// ==================== FUNCIONES API - SECTIONS ====================

// GET /tenants/{tenantSlug}/groups/{groupSlug}/sections
export const getAllSections = async (tenantSlug?: string, groupSlug?: string): Promise<Section[]> => {
  const url = (tenantSlug && groupSlug) 
    ? `/tenants/${tenantSlug}/groups/${groupSlug}/sections` 
    : buildTenantGroupUrl('sections');
  const response = await api.get(url);
  return response.data;
};

// GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
export const getSectionById = async (sectionId: number, tenantSlug?: string, groupSlug?: string): Promise<Section> => {
  const url = (tenantSlug && groupSlug) 
    ? `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}` 
    : buildTenantGroupUrl(`sections/${sectionId}`);
  const response = await api.get(url);
  return response.data;
};

// GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/with-subgroups
export const getSectionWithSubgroups = async (sectionId: number, tenantSlug?: string, groupSlug?: string): Promise<SectionWithSubgroups> => {
  const url = (tenantSlug && groupSlug) 
    ? `/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/with-subgroups` 
    : buildTenantGroupUrl(`sections/${sectionId}/with-subgroups`);
  const response = await api.get(url);
  return response.data;
};

// POST /tenants/{tenantSlug}/groups/{groupSlug}/sections
export const createSection = async (section: CreateSectionRequest, tenantSlug?: string, groupSlug?: string): Promise<Section> => {
  const url = (tenantSlug && groupSlug) 
    ? `/tenants/${tenantSlug}/groups/${groupSlug}/sections` 
    : buildTenantGroupUrl('sections');
  const response = await api.post(url, section);
  return response.data;
};

// PUT /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
export const updateSection = async (tenantSlug: string, groupSlug: string, sectionId: number, section: CreateSectionRequest): Promise<Section> => {
  const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`, section);
  return response.data;
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
export const deleteSection = async (tenantSlug: string, groupSlug: string, sectionId: number): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`);
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/icon
export const updateSectionIcon = async (tenantSlug: string, groupSlug: string, sectionId: number, objectId: string): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`, { objectId });
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/photo-principal
export const updateSectionPhotoPrincipal = async (tenantSlug: string, groupSlug: string, sectionId: number, objectId: string): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/photo-principal`, { objectId });
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/gallery
export const updateSectionGallery = async (tenantSlug: string, groupSlug: string, sectionId: number, operations: GalleryOperationRequest): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery`, operations);
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/icon
export const deleteSectionIcon = async (tenantSlug: string, groupSlug: string, sectionId: number): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`);
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/gallery/{objectId}
export const deleteSectionGalleryImage = async (tenantSlug: string, groupSlug: string, sectionId: number, objectId: string, deleteFromStorage = false): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery/${objectId}?deleteFromStorage=${deleteFromStorage}`);
};

// ==================== FUNCIONES API - SUBGROUPS ====================

// GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups
export const getAllSubgroups = async (tenantSlug: string, groupSlug: string, sectionId: number): Promise<Subgroup[]> => {
  const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`);
  return response.data;
};

// GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
export const getSubgroupById = async (tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number): Promise<Subgroup> => {
  const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
  return response.data;
};

// POST /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups
export const createSubgroup = async (tenantSlug: string, groupSlug: string, sectionId: number, subgroup: CreateSubgroupRequest): Promise<Subgroup> => {
  const response = await api.post(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`, subgroup);
  return response.data;
};

// PUT /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
export const updateSubgroup = async (tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number, subgroup: CreateSubgroupRequest): Promise<Subgroup> => {
  const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`, subgroup);
  return response.data;
};

// DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
export const deleteSubgroup = async (tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number): Promise<void> => {
  await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
};

// PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}/photo-principal
export const updateSubgroupPhotoPrincipal = async (tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number, objectId: string): Promise<void> => {
  await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`, { objectId });
};

// ==================== FUNCIONES API - STORAGE ====================

// POST /storage/upload
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post("/storage/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// ==================== FUNCIONES API - TESTING ====================

// GET /test/health
export const checkHealth = async (): Promise<{ status: string; message: string; timestamp: string }> => {
  const response = await api.get("/test/health");
  return response.data;
};

// POST /test/upload/image
export const uploadTestImage = async (file: File): Promise<{
  message: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  bucket: string;
  size: number;
  contentType: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post("/test/upload/image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// POST /test/upload/document
export const uploadTestDocument = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post("/test/upload/document", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// GET /test/file-url
export const getFileUrl = async (fileName: string, bucket = "images"): Promise<FileUrlResponse> => {
  const response = await api.get(`/test/file-url?fileName=${fileName}&bucket=${bucket}`);
  return response.data;
};

// Tipos para Tenants
export interface Tenant {
  tenantId: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  tenantId: string;
  slug: string;
  status: string;
}

// Tipos para Groups
export interface Group {
  groupId: number;
  tenantId: string;
  slug: string;
  name: string;
  district: string;
  identifierNumber: string;
  address: string;
  phone: string;
  email: string;
  foundedIn: string;
  motto: string;
  mission: string;
  vision: string;
  history: string;
  logoObjectId: string;
  scarfObjectId: string;
  socialLinks: Record<string, unknown>;
  config: Record<string, unknown>;
  isActive: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupRequest {
  groupId: number;
  tenantId: string;
  slug: string;
  name: string;
  district: string;
  identifierNumber: string;
  address: string;
  phone: string;
  email: string;
  foundedIn: string;
  motto: string;
  mission: string;
  vision: string;
  history: string;
  logoObjectId: string;
  scarfObjectId: string;
  socialLinks: Record<string, unknown>;
  config: Record<string, unknown>;
  isActive: boolean;
  status: string;
}

// Tipos para Sections (Secciones/Ramas)
export interface Section {
  sectionId: number;
  tenantId: string;
  groupId: number;
  name: string;
  description: string;
  iconObjectId: string;
  photoPrincipal: string;
  galleryObjectIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  sectionId: number;
  tenantId: string;
  groupId: number;
  name: string;
  description: string;
  iconObjectId: string;
  photoPrincipal: string;
  galleryObjectIds: string[];
}

export interface SectionWithSubgroups extends Section {
  subgroups: Subgroup[];
}

// Tipos para Subgroups
export interface Subgroup {
  subgroupId: number;
  tenantId: string;
  groupId: number;
  sectionId: number;
  name: string;
  description: string;
  photoPrincipal: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubgroupRequest {
  subgroupId: number;
  tenantId: string;
  groupId: number;
  sectionId: number;
  name: string;
  description: string;
  photoPrincipal: string;
  isActive: boolean;
}

// Tipos para operaciones de galería
export interface GalleryOperation {
  op: "replace" | "add" | "remove";
  targetUuid: string;
  newValue?: string;
}

export interface GalleryOperationRequest {
  operations: GalleryOperation[];
}

// Tipos para Storage
export interface UploadResponse {
  objectId: string;
}

export interface FileUrlResponse {
  fileName: string;
  bucket: string;
  fileUrl: string;
}

// ==================== FUNCIONES API - TENANTS ====================

export const tenantApi = {
  // GET /tenants
  async getAllTenants(): Promise<Tenant[]> {
    const response = await api.get("/tenants");
    return response.data;
  },

  // GET /tenants/{tenantSlug}
  async getTenantBySlug(tenantSlug: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${tenantSlug}`);
    return response.data;
  },

  // POST /tenants
  async createTenant(tenant: CreateTenantRequest): Promise<Tenant> {
    const response = await api.post("/tenants", tenant);
    return response.data;
  },

  // PUT /tenants/{tenantSlug}
  async updateTenant(tenantSlug: string, tenant: CreateTenantRequest): Promise<Tenant> {
    const response = await api.put(`/tenants/${tenantSlug}`, tenant);
    return response.data;
  },

  // DELETE /tenants/{tenantSlug}
  async deleteTenant(tenantSlug: string): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}`);
  }
};

// ==================== FUNCIONES API - GROUPS ====================

export const groupApi = {
  // GET /tenants/{tenantSlug}/groups
  async getAllGroups(tenantSlug: string): Promise<Group[]> {
    const response = await api.get(`/tenants/${tenantSlug}/groups`);
    return response.data;
  },

  // GET /tenants/{tenantSlug}/groups/{groupSlug}
  async getGroupBySlug(tenantSlug: string, groupSlug: string): Promise<Group> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}`);
    return response.data;
  },

  // POST /tenants/{tenantSlug}/groups
  async createGroup(tenantSlug: string, group: CreateGroupRequest): Promise<Group> {
    const response = await api.post(`/tenants/${tenantSlug}/groups`, group);
    return response.data;
  },

  // PUT /tenants/{tenantSlug}/groups/{groupSlug}
  async updateGroup(tenantSlug: string, groupSlug: string, group: CreateGroupRequest): Promise<Group> {
    const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}`, group);
    return response.data;
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}
  async deleteGroup(tenantSlug: string, groupSlug: string): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}`);
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/logo
  async updateGroupLogo(tenantSlug: string, groupSlug: string, objectId: string): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/logo`, { objectId });
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/scarf
  async updateGroupScarf(tenantSlug: string, groupSlug: string, objectId: string): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/scarf`, { objectId });
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/logo
  async deleteGroupLogo(tenantSlug: string, groupSlug: string): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/logo`);
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/scarf
  async deleteGroupScarf(tenantSlug: string, groupSlug: string): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/scarf`);
  }
};

// ==================== FUNCIONES API - SECTIONS ====================

export const sectionApi = {
  // GET /tenants/{tenantSlug}/groups/{groupSlug}/sections
  async getAllSections(tenantSlug: string, groupSlug: string): Promise<Section[]> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections`);
    return response.data;
  },

  // GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
  async getSectionById(tenantSlug: string, groupSlug: string, sectionId: number): Promise<Section> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`);
    return response.data;
  },

  // GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/with-subgroups
  async getSectionWithSubgroups(tenantSlug: string, groupSlug: string, sectionId: number): Promise<SectionWithSubgroups> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/with-subgroups`);
    return response.data;
  },

  // POST /tenants/{tenantSlug}/groups/{groupSlug}/sections
  async createSection(tenantSlug: string, groupSlug: string, section: CreateSectionRequest): Promise<Section> {
    const response = await api.post(`/tenants/${tenantSlug}/groups/${groupSlug}/sections`, section);
    return response.data;
  },

  // PUT /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
  async updateSection(tenantSlug: string, groupSlug: string, sectionId: number, section: CreateSectionRequest): Promise<Section> {
    const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`, section);
    return response.data;
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}
  async deleteSection(tenantSlug: string, groupSlug: string, sectionId: number): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}`);
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/icon
  async updateSectionIcon(tenantSlug: string, groupSlug: string, sectionId: number, objectId: string): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`, { objectId });
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/photo-principal
  async updateSectionPhotoPrincipal(tenantSlug: string, groupSlug: string, sectionId: number, objectId: string): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/photo-principal`, { objectId });
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/gallery
  async updateSectionGallery(tenantSlug: string, groupSlug: string, sectionId: number, operations: GalleryOperationRequest): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery`, operations);
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/icon
  async deleteSectionIcon(tenantSlug: string, groupSlug: string, sectionId: number): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/icon`);
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/gallery/{objectId}
  async deleteSectionGalleryImage(tenantSlug: string, groupSlug: string, sectionId: number, objectId: string, deleteFromStorage = false): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/gallery/${objectId}?deleteFromStorage=${deleteFromStorage}`);
  }
};

// ==================== FUNCIONES API - SUBGROUPS ====================

export const subgroupApi = {
  // GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups
  async getAllSubgroups(tenantSlug: string, groupSlug: string, sectionId: number): Promise<Subgroup[]> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`);
    return response.data;
  },

  // GET /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
  async getSubgroupById(tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number): Promise<Subgroup> {
    const response = await api.get(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
    return response.data;
  },

  // POST /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups
  async createSubgroup(tenantSlug: string, groupSlug: string, sectionId: number, subgroup: CreateSubgroupRequest): Promise<Subgroup> {
    const response = await api.post(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups`, subgroup);
    return response.data;
  },

  // PUT /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
  async updateSubgroup(tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number, subgroup: CreateSubgroupRequest): Promise<Subgroup> {
    const response = await api.put(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`, subgroup);
    return response.data;
  },

  // DELETE /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}
  async deleteSubgroup(tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number): Promise<void> {
    await api.delete(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}`);
  },

  // PATCH /tenants/{tenantSlug}/groups/{groupSlug}/sections/{sectionId}/subgroups/{subgroupId}/photo-principal
  async updateSubgroupPhotoPrincipal(tenantSlug: string, groupSlug: string, sectionId: number, subgroupId: number, objectId: string): Promise<void> {
    await api.patch(`/tenants/${tenantSlug}/groups/${groupSlug}/sections/${sectionId}/subgroups/${subgroupId}/photo-principal`, { objectId });
  }
};

// ==================== FUNCIONES API - STORAGE ====================

export const storageApi = {
  // POST /storage/upload
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post("/storage/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// ==================== FUNCIONES API - TESTING ====================

export const testApi = {
  // GET /test/health
  async checkHealth(): Promise<{ status: string; message: string; timestamp: string }> {
    const response = await api.get("/test/health");
    return response.data;
  },

  // POST /test/upload/image
  async uploadTestImage(file: File): Promise<{
    message: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    bucket: string;
    size: number;
    contentType: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post("/test/upload/image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // POST /test/upload/document
  async uploadTestDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post("/test/upload/document", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // GET /test/file-url
  async getFileUrl(fileName: string, bucket = "images"): Promise<FileUrlResponse> {
    const response = await api.get(`/test/file-url?fileName=${fileName}&bucket=${bucket}`);
    return response.data;
  }
};

// ==================== EXPORTACIÓN COMBINADA ====================

// Exporta todas las APIs en un objeto para facilitar el uso
export const organigramaApi = {
  tenant: tenantApi,
  group: groupApi,
  section: sectionApi,
  subgroup: subgroupApi,
  storage: storageApi,
  test: testApi
};

// Exportación por defecto
export default organigramaApi;
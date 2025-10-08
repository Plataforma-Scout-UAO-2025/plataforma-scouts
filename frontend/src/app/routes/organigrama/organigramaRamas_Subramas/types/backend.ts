// Backend response / request types (Stage 3)

/** BackendBranch (BackendRama) */
export interface BackendBranch {
  sectionId?: string | number;
  section_id?: string;
  id?: string;
  ID?: string;
  Section_ID?: string;
  tenantId?: number;
  groupId?: number;
  name: string;
  sectionName?: string;
  description?: string;
  sectionDescription?: string;
  iconObjectUrl?: string | null;
  photoPrincipalUrl?: string | null;
  photoPrincipalObjectId?: string;
  iconObjectId?: string;
  galleryObjectUrls?: string[];
  galleryObjectIds?: string[];
  sectionGalleryObjectIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  minAge?: number;
  maxAge?: number;
}

/** BackendSubgroup (BackendSubrama) */
export interface BackendSubgroup {
  subgroup_id?: string;
  subgroupId?: string;
  id?: string;
  ID?: string;
  subgroupIdLegacy?: string;
  subgroupName?: string;
  subgroup_name?: string;
  name?: string;
  nombre?: string;
  subgroupDescription?: string;
  subgroup_description?: string;
  description?: string;
  section_id?: string;
  sectionId?: string;
  leader?: string;
  leaderName?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  memberCount?: number;
  members?: number;
  iconObjectUrl?: string | null;
  photoPrincipalUrl?: string | null;
  galleryObjectUrls?: string[];
  iconObjectId?: string;
  photoPrincipalObjectId?: string;
  galleryObjectIds?: string[];
}

// Backend request payloads
export interface CreateBranchBackendData {
  name: string;
  description?: string;
  iconObjectId: string | null;
  galleryObjectIds: string[];
}

export interface UpdateBranchBackendData {
  name?: string;
  description?: string;
  iconObjectId?: string | null;
  galleryObjectIds?: string[];
}

export interface CreateSubgroupBackendData {
  name: string;
  description?: string;
  galleryObjectIds?: string[];
  // Some backends expect snake_case field names for JSON. Keep both to be flexible.
  isActive?: boolean;
  is_active?: boolean;
}

export interface UpdateSubgroupBackendData {
  name?: string;
  description?: string;
  galleryObjectIds?: string[];
  isActive?: boolean;
  is_active?: boolean;
}

export interface UpdateSubgroupMainImageData {
  objectId: string;
}
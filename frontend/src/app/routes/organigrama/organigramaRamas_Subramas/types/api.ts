// Tipos canónicos para respuestas del API (confirmados por backend)
export interface GalleryItemDTO {
  id: string;
  url: string;
}

export interface SectionLegacyDTO {
  section_id: number | string;
  tenant_id: string;
  group_id: number;
  name: string;
  description?: string | null;
  icon_object_url?: string | null;
  icon_object_id?: string | null;
  photo_principal_url?: string | null;
  photo_principal_object_id?: string | null;
  gallery_object_urls?: string[];
  gallery_object_ids?: string[];
  gallery?: GalleryItemDTO[];
  created_at?: string;
  updated_at?: string;
}

export interface SectionCanonicalDTO {
  sectionId: number | string;
  tenantId: string;
  groupId: number;
  name: string;
  description?: string | null;
  iconObjectUrl?: string | null;
  iconObjectId?: string | null;
  photoPrincipalUrl?: string | null;
  photoPrincipalObjectId?: string | null;
  galleryObjectUrls?: string[];
  galleryObjectIds?: string[];
  gallery?: GalleryItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export type SectionDTO = SectionLegacyDTO | SectionCanonicalDTO;

export interface SubgroupLegacyDTO {
  subgroup_id: number | string;
  tenant_id: string;
  group_id: number;
  section_id: number | string;
  name: string;
  description?: string | null;
  photo_principal_url?: string | null;
  photo_principal_object_id?: string | null;
  icon_object_url?: string | null;
  icon_object_id?: string | null;
  gallery_object_urls?: string[];
  gallery_object_ids?: string[];
  gallery?: GalleryItemDTO[];
  leader?: string | null;
  leader_name?: string | null;
  leaderName?: string | null;
  members?: number;
  member_count?: number;
  memberCount?: number;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubgroupCanonicalDTO {
  subgroupId: number | string;
  tenantId: string;
  groupId: number;
  sectionId: number | string;
  name: string;
  description?: string | null;
  photoPrincipalUrl?: string | null;
  photoPrincipalObjectId?: string | null;
  iconObjectUrl?: string | null;
  iconObjectId?: string | null;
  galleryObjectUrls?: string[];
  galleryObjectIds?: string[];
  gallery?: GalleryItemDTO[];
  leader?: string | null;
  leaderName?: string | null;
  members?: number;
  memberCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SubgroupDTO = SubgroupLegacyDTO | SubgroupCanonicalDTO;

export interface SectionWithSubgroupsDTO {
  section: SectionDTO;
  subgroups: SubgroupDTO[];
}

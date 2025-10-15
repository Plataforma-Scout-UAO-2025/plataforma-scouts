import type {
  Branch as Rama,
  Subgroup as Subrama,
  CreateBranchData as CreateRamaData,
  UpdateBranchData as UpdateRamaData,
  CreateSubgroupData as CreateSubramaData,
  UpdateSubgroupData as UpdateSubramaData,
} from '../types/frontend';
import type { Section as SectionDTO } from '@/types/section-simple.type';
import type { Subgroup as SubgroupDTO } from '@/types/subgroup-simple.type';
import type {
  CreateBranchBackendData as CreateRamaBackendData,
  UpdateBranchBackendData as UpdateRamaBackendData,
  CreateSubgroupBackendData as CreateSubramaBackendData,
  UpdateSubgroupBackendData as UpdateSubramaBackendData,
} from '../types/backend';

type AnyRecord = Record<string, unknown>;

type GalleryItem = {
  id: string;
  url: string;
};

const toRecord = (value: unknown): AnyRecord =>
  value && typeof value === 'object' ? (value as AnyRecord) : {};

const pickString = (record: AnyRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (['active', 'activa', 'true', '1', 'enabled'].includes(normalized)) return true;
    if (['inactive', 'inactiva', 'false', '0', 'disabled'].includes(normalized)) return false;
    return undefined;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return undefined;
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
};

const resolveIsActiveFlag = (record: AnyRecord): boolean | undefined => {
  const candidates = [record.isActive, record.is_active, record.status, record.estado];
  for (const candidate of candidates) {
    const normalized = toBoolean(candidate);
    if (normalized !== undefined) return normalized;
  }
  return undefined;
};

const extractPhotoPrincipal = (record: AnyRecord): string | null | undefined => {
  if ('photoPrincipal' in record) {
    const value = record.photoPrincipal;
    if (value === null) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
  }

  const candidateKeys = [
    'photoPrincipalUrl',
    'photoPrincipalObjectId',
    'photo_principal_object_id',
    'mainImageObjectId',
    'imagenPrincipalObjectId',
  ];

  for (const key of candidateKeys) {
    const candidate = record[key];
    if (candidate === null) return null;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }

  return undefined;
};

const extractGallery = (record: AnyRecord): GalleryItem[] | undefined => {
  const raw = record.gallery;
  if (!Array.isArray(raw)) return undefined;

  const items = raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return undefined;
      const entryRecord = entry as AnyRecord;
      const id = pickString(entryRecord, ['id', 'objectId', 'object_id']);
      const url = pickString(entryRecord, ['url']);
      if (!id || !url) return undefined;
      return { id, url } satisfies GalleryItem;
    })
    .filter((item): item is GalleryItem => item !== undefined);

  return items.length > 0 ? items : undefined;
};

const safeIsoDate = (value: string | undefined): string => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const deriveYear = (isoDate: string): number => {
  const parsed = new Date(isoDate);
  const year = parsed.getUTCFullYear();
  return Number.isNaN(year) ? new Date().getUTCFullYear() : year;
};

export const mapBackendRamaToFrontend = (backendRama: SectionDTO): Rama => {
  const record = toRecord(backendRama);

  const sectionId = String(record.sectionId || '');
  const name = (record.name as string) ?? '';
  const description = record.description as string;
  const iconUrl = record.icon_object_url as string;
  const iconObjectId = record.icon_object_id as string;
  const mainImageUrl = record.photo_principal_url as string;
  const mainImageObjectId = record.photo_principal_object_id as string;
  const minAge = (record.minAge as number) ?? 0;
  const maxAge = (record.maxAge as number) ?? 0;
  const createdAt = safeIsoDate(record.createdAt as string);
  const gallery = extractGallery(record);
  const galleryObjectIds = gallery?.map((item) => item.id) ?? [];

  const mappedRama: Rama = {
    id: sectionId,
    sectionId,
    name,
    description,
    iconUrl,
    iconObjectId,
    mainImageUrl,
    mainImageObjectId,
    minAge,
    maxAge,
    year: deriveYear(createdAt),
    status: 'active',
    createdAt,
    galleryObjectIds,
    gallery,
    subgroups: [],
  };

  return mappedRama;
};

export const mapBackendSubramaToFrontend = (backendSubrama: SubgroupDTO): Subrama => {
  const record = toRecord(backendSubrama);

  const subgroupId = String(record.subgroupId || '');
  const sectionId = String(record.sectionId || '');
  const name = (record.name as string) ?? '';
  const description = record.description as string;
  const iconUrl = record.icon_object_url as string;
  const iconObjectId = record.icon_object_id as string;
  const mainImageUrl = record.photo_principal_url as string;
  const mainImageObjectId = record.photo_principal_object_id as string;
  const leader = record.leader as string;
  const createdAt = safeIsoDate(record.createdAt as string);
  const memberCount = (record.memberCount as number) ?? 0;
  const gallery = extractGallery(record);
  const galleryObjectIds = gallery?.map((item) => item.id) ?? [];
  const isActive = (record.isActive as boolean) ?? true;

  const mappedSubrama: Subrama = {
    id: subgroupId,
    subgroupName: name,
    name,
    description,
    iconUrl,
    iconObjectId,
    mainImageUrl,
    mainImageObjectId,
    branchId: sectionId,
    leader,
    status: isActive ? 'active' : 'inactive',
    createdAt,
    memberCount,
    galleryObjectIds,
    gallery,
  };

  return mappedSubrama;
};

export const mapFrontendCreateRamaToBackend = (
  frontendData: CreateRamaData,
): CreateRamaBackendData => ({
  name: frontendData.name,
  description: frontendData.description,
  iconObjectId: null,
  galleryObjectIds: [],
});

export const mapFrontendUpdateRamaToBackend = (
  frontendData: UpdateRamaData,
): UpdateRamaBackendData => {
  const backendData: UpdateRamaBackendData = {};

  if (frontendData.name !== undefined) backendData.name = frontendData.name;
  if (frontendData.description !== undefined) backendData.description = frontendData.description;
  if (frontendData.iconFile !== undefined) backendData.iconObjectId = null;
  if (frontendData.galleryFiles !== undefined) backendData.galleryObjectIds = [];

  return backendData;
};

export const mapFrontendCreateSubramaToBackend = (
  frontendData: CreateSubramaData,
): CreateSubramaBackendData => {
  const record = frontendData as unknown as AnyRecord;
  const backendData: CreateSubramaBackendData = {
    name: frontendData.name,
  };

  if (frontendData.description !== undefined) backendData.description = frontendData.description;

  const photoPrincipal = extractPhotoPrincipal(record);
  if (photoPrincipal !== undefined) backendData.photoPrincipal = photoPrincipal;

  const isActive = resolveIsActiveFlag(record);
  backendData.isActive = isActive ?? true;

  return backendData;
};

export const mapFrontendUpdateSubramaToBackend = (
  frontendData: UpdateSubramaData,
): UpdateSubramaBackendData => {
  const backendData: UpdateSubramaBackendData = {};

  const record = frontendData as unknown as AnyRecord;

  if (frontendData.name !== undefined) backendData.name = frontendData.name;
  if (frontendData.description !== undefined) backendData.description = frontendData.description;
  const isActive = resolveIsActiveFlag(record);
  if (isActive !== undefined) backendData.isActive = isActive;

  const photoPrincipal = extractPhotoPrincipal(record);
  if (photoPrincipal !== undefined) backendData.photoPrincipal = photoPrincipal;

  return backendData;
};
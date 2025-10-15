import type {
  Branch as Rama,
  Subgroup as Subrama,
  CreateBranchData as CreateRamaData,
  UpdateBranchData as UpdateRamaData,
  CreateSubgroupData as CreateSubramaData,
  UpdateSubgroupData as UpdateSubramaData,
} from '../types/frontend';
import type { SectionDTO, SubgroupDTO } from '../types/api';
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

const pickIdentifier = (record: AnyRecord, keys: string[]): string | undefined => {
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

const pickNumber = (record: AnyRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
};

const pickBoolean = (record: AnyRecord, keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
};

const pickStringArray = (record: AnyRecord, keys: string[]): string[] | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) continue;

    const normalized = value
      .map((entry) => {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          return trimmed.length > 0 ? trimmed : undefined;
        }
        if (typeof entry === 'number' && Number.isFinite(entry)) {
          return String(entry);
        }
        return undefined;
      })
      .filter((item): item is string => item !== undefined);

    return normalized;
  }
  return undefined;
};

const ensureIdentifier = (record: AnyRecord, keys: string[], entity: string): string => {
  const identifier = pickIdentifier(record, keys);
  if (!identifier) {
    throw new Error(`${entity} sin identificador valido en la respuesta del backend.`);
  }
  return identifier;
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

  const sectionId = ensureIdentifier(record, ['sectionId', 'section_id'], 'Section');
  const name = pickString(record, ['name', 'sectionName']) ?? '';
  const description = pickString(record, ['description', 'sectionDescription']);
  const iconUrl = pickString(record, ['iconObjectUrl', 'icon_object_url']);
  const iconObjectId = pickString(record, ['iconObjectId', 'icon_object_id']);
  const mainImageUrl = pickString(record, ['photoPrincipalUrl', 'photo_principal_url']);
  const mainImageObjectId = pickString(record, ['photoPrincipalObjectId', 'photo_principal_object_id']);
  const minAge = pickNumber(record, ['minAge', 'min_age']) ?? 0;
  const maxAge = pickNumber(record, ['maxAge', 'max_age']) ?? 0;
  const createdAt = safeIsoDate(pickString(record, ['createdAt', 'created_at']));
  const gallery = extractGallery(record);
  const galleryObjectIds =
    pickStringArray(record, ['galleryObjectIds', 'gallery_object_ids', 'sectionGalleryObjectIds']) ??
    gallery?.map((item) => item.id) ??
    [];
  const galleryObjectUrls = pickStringArray(record, ['galleryObjectUrls', 'gallery_object_urls']);

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

  // Maintain legacy aliases until the UI completes the migration.
  const ramaRecord = mappedRama as unknown as AnyRecord;
  ramaRecord.section_id = sectionId;
  ramaRecord.nombre = mappedRama.name;
  ramaRecord.descripcion = mappedRama.description;
  ramaRecord.icono = mappedRama.iconUrl;
  ramaRecord.iconoObjectId = mappedRama.iconObjectId;
  ramaRecord.imagenPrincipal = mappedRama.mainImageUrl;
  ramaRecord.imagenPrincipalObjectId = mappedRama.mainImageObjectId;
  ramaRecord.sectionGalleryObjectIds = mappedRama.galleryObjectIds;
  ramaRecord.gallery = mappedRama.gallery ?? [];
  ramaRecord.galleryObjectUrls = galleryObjectUrls ?? [];
  ramaRecord.subramas = mappedRama.subgroups;
  ramaRecord.ramaId = mappedRama.sectionId;
  ramaRecord['año'] = mappedRama.year;

  return mappedRama;
};

export const mapBackendSubramaToFrontend = (backendSubrama: SubgroupDTO): Subrama => {
  const record = toRecord(backendSubrama);

  const subgroupId = ensureIdentifier(record, ['subgroupId', 'subgroup_id', 'id'], 'Subgroup');
  const sectionId = ensureIdentifier(record, ['sectionId', 'section_id'], 'Section para Subgroup');
  const name = pickString(record, ['name', 'subgroupName', 'subgroup_name']) ?? '';
  const description = pickString(record, ['description', 'subgroupDescription', 'subgroup_description']);
  const iconUrl = pickString(record, ['iconObjectUrl', 'icon_object_url']);
  const iconObjectId = pickString(record, ['iconObjectId', 'icon_object_id']);
  const mainImageUrl = pickString(record, ['photoPrincipalUrl', 'photo_principal_url']);
  const mainImageObjectId = pickString(record, ['photoPrincipalObjectId', 'photo_principal_object_id']);
  const leader = pickString(record, ['leader', 'leaderName', 'leader_name']);
  const createdAt = safeIsoDate(pickString(record, ['createdAt', 'created_at']));
  const memberCount = pickNumber(record, ['memberCount', 'members']) ?? 0;
  const gallery = extractGallery(record);
  const galleryObjectIds =
    pickStringArray(record, ['galleryObjectIds', 'gallery_object_ids', 'subgroupGalleryObjectIds']) ??
    gallery?.map((item) => item.id) ??
    [];
  const galleryObjectUrls = pickStringArray(record, ['galleryObjectUrls', 'gallery_object_urls']);
  const isActive = pickBoolean(record, ['isActive', 'is_active']);

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
    status: isActive === false ? 'inactive' : 'active',
    createdAt,
    memberCount,
    galleryObjectIds,
    gallery,
  };

  // Maintain legacy aliases until the UI completes the migration.
  const subramaRecord = mappedSubrama as unknown as AnyRecord;
  subramaRecord.section_id = mappedSubrama.branchId;
  subramaRecord.subgroup_id = mappedSubrama.id;
  subramaRecord.nombre = mappedSubrama.name;
  subramaRecord.descripcion = mappedSubrama.description;
  subramaRecord.icono = mappedSubrama.iconUrl;
  subramaRecord.iconoObjectId = mappedSubrama.iconObjectId;
  subramaRecord.imagenPrincipal = mappedSubrama.mainImageUrl;
  subramaRecord.subgroupGalleryObjectIds = mappedSubrama.galleryObjectIds ?? [];
  subramaRecord.gallery = mappedSubrama.gallery ?? [];
  subramaRecord.galleryObjectUrls = galleryObjectUrls ?? [];
  subramaRecord.ramaId = mappedSubrama.branchId;

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


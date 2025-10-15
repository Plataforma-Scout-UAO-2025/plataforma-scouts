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
  BackendBranch as BackendRama,
  BackendSubgroup as BackendSubrama,
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
    // canonical ids
  id: sectionId,
  sectionId: sectionId,

    // standard english fields
    name: backendRama.name || '',
    description: backendRama.description || undefined,

    // image urls
  iconUrl: iconUrl || undefined,
    iconObjectId: backendRama.iconObjectId,
    mainImageUrl: photoPrincipalUrl || undefined,
    mainImageObjectId: backendRama.photoPrincipalObjectId,

    // ages and year
    // Intentar extraer min/max de campos explícitos; si no existen intentar parsear la descripción
    // Ej: "Edades de 7 a 11 años" -> minAge=7, maxAge=11
    // Por compatibilidad con el resto del código, mantenemos número (fallback 0 si no hay dato)
    minAge: ((): number => {
      if (typeof backendRama.minAge === 'number') return backendRama.minAge;
      const desc = backendRama.description as string | undefined;
      if (desc) {
        const m = desc.match(/(\d{1,2})\s*(?:-|a|to)\s*(\d{1,2})/i);
        if (m) return parseInt(m[1], 10);
      }
      return 0;
    })(),
    maxAge: ((): number => {
      if (typeof backendRama.maxAge === 'number') return backendRama.maxAge;
      const desc = backendRama.description as string | undefined;
      if (desc) {
        const m = desc.match(/(\d{1,2})\s*(?:-|a|to)\s*(\d{1,2})/i);
        if (m) return parseInt(m[2], 10);
      }
      return 0;
    })(),
    year: new Date().getFullYear(),

    status: 'active',
    createdAt: backendRama.createdAt ? backendRama.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],

    // gallery: prefer canonical array, expose ids as galleryObjectIds
  galleryObjectIds: galleryArray ? galleryArray.map(g => String(g['id'] ?? g['objectId'] ?? '')).filter(Boolean) : galleryUrls,
  gallery: galleryArray ? galleryArray.map((g) => { const rec = g as unknown as Record<string, unknown>; return { id: String(rec['id'] ?? rec['objectId'] ?? ''), url: String(rec['url'] ?? '') }; }) : undefined,

    // subgroups loaded separately
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

// Mapear datos del frontend al formato que espera el backend para crear Ramas
export const mapFrontendCreateRamaToBackend = (frontendData: CreateRamaData): CreateRamaBackendData => {
  // Accept either Spanish (nombre) or English (name) frontend payloads
  const maybe = frontendData as unknown as Record<string, unknown>;
  const name = (maybe.name ?? maybe.nombre) as string | undefined;
  const description = (maybe.description ?? maybe.descripcion) as string | undefined;
  return {
    name: name ?? '',
    description,
    iconObjectId: null,
    galleryObjectIds: []
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Ramas
export const mapFrontendUpdateRamaToBackend = (frontendData: UpdateRamaData): UpdateRamaBackendData => {
  const backendData: UpdateRamaBackendData = {};
  const maybe = frontendData as unknown as Record<string, unknown>;
  if (maybe.name !== undefined) backendData.name = maybe.name as unknown as string;
  if (maybe.nombre !== undefined) backendData.name = maybe.nombre as unknown as string;
  if (maybe.description !== undefined) backendData.description = maybe.description as unknown as string;
  if (maybe.descripcion !== undefined) backendData.description = maybe.descripcion as unknown as string;

  backendData.iconObjectId = null;
  backendData.galleryObjectIds = [];

  return backendData;
};

// Mapear datos del frontend al formato que espera el backend para crear Subramas
export const mapFrontendCreateSubramaToBackend = (frontendData: CreateSubramaData): CreateSubramaBackendData => {
  const maybe = frontendData as unknown as Record<string, unknown>;
  const base: Record<string, unknown> = {
    name: ((maybe.name ?? maybe.nombre) as string | undefined) ?? '',
    description: (maybe.description ?? maybe.descripcion) as string | undefined,
  };

  // Conditionally include gallery ids if provided
  if (maybe.galleryObjectIds !== undefined) base.galleryObjectIds = maybe.galleryObjectIds as string[];

  // Backend appears to expect snake_case 'is_active' — include both forms only if the frontend provided state
  if (maybe.isActive !== undefined) {
    base.is_active = Boolean(maybe.isActive);
  } else if (maybe.estado !== undefined) {
    const isAct = String(maybe.estado) === 'activa';
    base.is_active = isAct;
  }

  return base as unknown as CreateSubramaBackendData;
};

// Mapear datos del frontend al formato que espera el backend para actualizar Subramas
export const mapFrontendUpdateSubramaToBackend = (frontendData: UpdateSubramaData): UpdateSubramaBackendData => {
  const backendData: UpdateSubramaBackendData = {} as UpdateSubramaBackendData;
  const maybe = frontendData as unknown as Record<string, unknown>;
  if (maybe.name !== undefined) backendData.name = maybe.name as unknown as string;
  if (maybe.nombre !== undefined) backendData.name = maybe.nombre as unknown as string;
  if (maybe.description !== undefined) backendData.description = maybe.description as unknown as string;
  if (maybe.descripcion !== undefined) backendData.description = maybe.descripcion as unknown as string;
  if (maybe.galleryObjectIds !== undefined) backendData.galleryObjectIds = maybe.galleryObjectIds as string[];
  if (maybe.isActive !== undefined) {
    backendData.is_active = Boolean(maybe.isActive);
  } else if (maybe.estado !== undefined) {
    const v = (maybe.estado as unknown as string) === 'activa';
    backendData.is_active = v;
  } else if (maybe.status !== undefined) {
    const v = (maybe.status as unknown as string) === 'active';
    backendData.is_active = v;
  }

  return backendData;
};
import type {
  Branch as Rama,
  Subgroup as Subrama,
  CreateBranchData as CreateRamaData,
  UpdateBranchData as UpdateRamaData,
  CreateSubgroupData as CreateSubramaData,
  UpdateSubgroupData as UpdateSubramaData,
} from '../types/frontend';
import type {
  CreateBranchBackendData as CreateRamaBackendData,
  UpdateBranchBackendData as UpdateRamaBackendData,
  CreateSubgroupBackendData as CreateSubramaBackendData,
  UpdateSubgroupBackendData as UpdateSubramaBackendData,
  BackendBranch as BackendRama,
  BackendSubgroup as BackendSubrama,
} from '../types/backend';

// Mapear datos del backend a formato frontend para Ramas
export const mapBackendRamaToFrontend = (backendRama: BackendRama): Rama => {
  // 🔍 LOG DETALLADO: Ver qué campos exactos recibimos del backend
  console.log('🔄 [Mapper] Input del backend completo:', JSON.stringify(backendRama, null, 2));
  
  // Intentar extraer el ID canonical que provee el backend desde varios nombres posibles
  const rawId = (backendRama as unknown as Record<string, unknown>).section_id ?? (backendRama as unknown as Record<string, unknown>).sectionId ?? (backendRama as unknown as Record<string, unknown>).id ?? (backendRama as unknown as Record<string, unknown>).ID;

  // Generar ID consistente basado en datos del backend si no hay ID real
  const generateConsistentId = () => {
    const uniqueString = `${(backendRama as any).name || ''}-${(backendRama as any).tenant_id || (backendRama as any).tenantId || ''}-${(backendRama as any).group_id || (backendRama as any).groupId || ''}`;
    let hash = 0;
    for (let i = 0; i < uniqueString.length; i++) {
      const char = uniqueString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  };

  const hasBackendId = rawId !== undefined && rawId !== null && rawId !== '';
  const sectionId = hasBackendId ? String(rawId) : generateConsistentId();

  // Extraer URLs soportando diferentes convenciones (snake_case y camelCase)
  const iconUrl = String((backendRama as unknown as Record<string, unknown>).icon_object_url ?? (backendRama as unknown as Record<string, unknown>).iconObjectUrl ?? '');
  const photoPrincipalUrl = String((backendRama as unknown as Record<string, unknown>).photo_principal_url ?? (backendRama as unknown as Record<string, unknown>).photoPrincipalUrl ?? '');
  const galleryUrls = ((backendRama as unknown as Record<string, unknown>).gallery_object_urls ?? (backendRama as unknown as Record<string, unknown>).galleryObjectUrls ?? []) as string[];

  // 🔍 LOG DETALLADO: Ver qué URLs exactas estamos extrayendo
  console.log('🔍 [Mapper] URLs extraídas:');
  console.log('   - iconUrl:', iconUrl);
  console.log('   - photoPrincipalUrl:', photoPrincipalUrl);
  console.log('   - galleryUrls:', galleryUrls);

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

    // gallery
  galleryObjectIds: galleryUrls,
      // canonical gallery array of objects (id + url) if backend provided it
  gallery: ((backendRama as unknown as Record<string, unknown>)['gallery'] && Array.isArray((backendRama as unknown as Record<string, unknown>)['gallery'])) ? ( (backendRama as unknown as Record<string, unknown>)['gallery'] as unknown[] ).map((g) => { const rec = g as unknown as Record<string, unknown>; return { id: String(rec['id'] ?? rec['objectId'] ?? ''), url: String(rec['url'] ?? '') }; }) : undefined,

    // subgroups loaded separately
    subgroups: [],

    // Spanish compatibility aliases (temporary) - attached below to avoid excess property errors
  };

  // Attach Spanish aliases to mappedRama to keep incremental consumers working
  const _mappedRamaAny = mappedRama as unknown as Record<string, unknown>;
  _mappedRamaAny.nombre = mappedRama.name;
  _mappedRamaAny.descripcion = mappedRama.description;
  // Use bracket notation for non-ASCII alias
  _mappedRamaAny['año'] = mappedRama.year;
  _mappedRamaAny.icono = mappedRama.iconUrl;
  _mappedRamaAny.iconoObjectId = mappedRama.iconObjectId;
  _mappedRamaAny.imagenPrincipal = mappedRama.mainImageUrl;
  _mappedRamaAny.imagenPrincipalObjectId = mappedRama.mainImageObjectId;
  _mappedRamaAny.sectionGalleryObjectIds = mappedRama.galleryObjectIds ?? [];
  _mappedRamaAny.gallery = mappedRama.gallery ?? [];
  _mappedRamaAny.galleryObjectUrls = mappedRama.galleryObjectIds ?? [];
  _mappedRamaAny.subramas = mappedRama.subgroups ?? [];
  _mappedRamaAny.section_id = mappedRama.sectionId;
  _mappedRamaAny.ramaId = mappedRama.sectionId;
  
  console.log('🔄 [Mapper] Rama mapeada final:', { 
    backend: { name: (backendRama as any).name, section_id: (backendRama as any).section_id ?? (backendRama as any).sectionId, id: (backendRama as any).id },
    frontend: { name: mappedRama.name, id: mappedRama.id, iconUrl: mappedRama.iconUrl, mainImageUrl: mappedRama.mainImageUrl }
  });
  
  return mappedRama;
};

// Mapear datos del backend a formato frontend para Subramas
export const mapBackendSubramaToFrontend = (backendSubrama: BackendSubrama): Subrama => {
  // 🔍 LOG DETALLADO: Ver qué campos exactos recibimos del backend para subramas
  console.log('🔄 [Mapper] Input del backend para SUBRAMA:', JSON.stringify(backendSubrama, null, 2));
  
  // Intentar extraer el ID canonical que provee el backend desde varios nombres posibles
  const rawId = backendSubrama.subgroup_id ?? backendSubrama.subgroupId ?? backendSubrama.id ?? backendSubrama.ID ?? backendSubrama.subgroupIdLegacy;

  // Generar ID consistente basado en datos del backend si no hay ID real
  const generateConsistentId = () => {
    // Usar campos únicos del backend para generar ID consistente
    const uniqueString = `${backendSubrama.subgroupName || ''}-${backendSubrama.section_id || ''}-${backendSubrama.subgroupDescription || ''}`;
    // Crear hash simple consistente
    let hash = 0;
    for (let i = 0; i < uniqueString.length; i++) {
      const char = uniqueString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }
    return Math.abs(hash).toString(); // Solo el número
  };

  const hasBackendId = rawId !== undefined && rawId !== null && rawId !== '';
  const extractedId = hasBackendId ? String(rawId) : undefined;
  const consistentId = hasBackendId ? String(rawId) : generateConsistentId();

  // Normalizar nombre intentanto varias posibles claves que el backend pueda usar
  const nameFromBackend =
    backendSubrama.subgroupName ||
    backendSubrama.subgroup_name ||
    backendSubrama.name ||
    backendSubrama.nombre ||
    '';

  // 🔍 CRÍTICO: Extraer URLs de imágenes (soportar snake_case y camelCase como en mapBackendRamaToFrontend)
  const iconUrl = String((backendSubrama as unknown as Record<string, unknown>).icon_object_url ?? (backendSubrama as unknown as Record<string, unknown>).iconObjectUrl ?? '');
  const photoPrincipalUrl = String((backendSubrama as unknown as Record<string, unknown>).photo_principal_url ?? (backendSubrama as unknown as Record<string, unknown>).photoPrincipalUrl ?? '');
  const galleryUrls = ((backendSubrama as unknown as Record<string, unknown>).gallery_object_urls ?? (backendSubrama as unknown as Record<string, unknown>).galleryObjectUrls ?? []) as string[];

  // 🔍 LOG DETALLADO: Ver qué URLs estamos extrayendo para subramas
  console.log('🔍 [Mapper] URLs extraídas para SUBRAMA:');
  console.log('   - iconUrl:', iconUrl);
  console.log('   - photoPrincipalUrl:', photoPrincipalUrl);
  console.log('   - galleryUrls:', galleryUrls);

  const mappedSubrama: Subrama = {
    id: extractedId ?? consistentId,
    subgroupName: nameFromBackend,
    name: nameFromBackend,
    description: backendSubrama.subgroupDescription || backendSubrama.subgroup_description || backendSubrama.description,

  iconUrl: iconUrl || undefined,
    iconObjectId: backendSubrama.iconObjectId,
    mainImageUrl: photoPrincipalUrl || undefined,
    mainImageObjectId: backendSubrama.photoPrincipalObjectId,

    branchId: backendSubrama.section_id || backendSubrama.sectionId || '',
    leader: backendSubrama.leader || backendSubrama.leaderName || undefined,

    status: (backendSubrama.isActive === false || backendSubrama.status === 'inactive') ? 'inactive' : 'active',
    createdAt: backendSubrama.createdAt ? backendSubrama.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],

    memberCount: backendSubrama.memberCount || backendSubrama.members || 0,
    galleryObjectIds: galleryUrls
  };

  // Spanish compatibility aliases for Subrama
  const _mappedSubramaAny = mappedSubrama as unknown as Record<string, unknown>;
  _mappedSubramaAny.nombre = mappedSubrama.name;
  _mappedSubramaAny.descripcion = mappedSubrama.description;
  _mappedSubramaAny.imagenPrincipal = mappedSubrama.mainImageUrl;
  _mappedSubramaAny.subgroupGalleryObjectIds = mappedSubrama.galleryObjectIds ?? [];
  _mappedSubramaAny.section_id = backendSubrama.section_id ?? backendSubrama.sectionId ?? '';
  _mappedSubramaAny.subgroup_id = mappedSubrama.id;
  _mappedSubramaAny.ramaId = backendSubrama.section_id ?? backendSubrama.sectionId ?? '';

  console.log('🔄 [Mapper] Subrama mapeada final:', { 
    backend: { name: backendSubrama.subgroupName || backendSubrama.name, subgroupId: backendSubrama.subgroup_id || backendSubrama.subgroupId },
    frontend: { 
      name: mappedSubrama.name, 
      id: mappedSubrama.id, 
      iconUrl: mappedSubrama.iconUrl, 
      mainImageUrl: mappedSubrama.mainImageUrl,
      galleryCount: mappedSubrama.galleryObjectIds?.length || 0
    }
  });

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
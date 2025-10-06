import type { 
  Rama, 
  Subrama, 
  CreateRamaData, 
  UpdateRamaData, 
  CreateSubramaData, 
  UpdateSubramaData,
  CreateRamaBackendData,
  UpdateRamaBackendData,
  CreateSubramaBackendData,
  UpdateSubramaBackendData,
  BackendRama,
  BackendSubrama
} from '../types/rama.type';
<<<<<<< HEAD
import { StorageService } from '../services/storage.service';

// Mapear datos del backend a formato frontend para Ramas
export const mapBackendRamaToFrontend = (backendRama: BackendRama): Rama => {
  // Intentar diferentes posibles nombres de campo para el ID
  const possibleId = backendRama.section_id ||
                     backendRama.id ||
                     backendRama.sectionId ||
                     backendRama.ID ||
                     backendRama.Section_ID ||
                     '';

  // Obtener URLs de imágenes desde el storage local si existen IDs
  const iconUrl = backendRama.iconObjectUrl || 
                  (backendRama.sectionGalleryObjectIds?.[0] ? StorageService.getImageUrl(backendRama.sectionGalleryObjectIds[0]) : null);

  const mappedRama = {
    section_id: possibleId,
    sectionName: backendRama.sectionName || backendRama.name || '',
    sectionDescription: backendRama.sectionDescription || backendRama.description,
    sectionGalleryObjectIds: backendRama.sectionGalleryObjectIds || [],
    // Mapeo para retrocompatibilidad con el frontend
    id: possibleId, // CRÍTICO: Este debe tener valor
    nombre: backendRama.sectionName || backendRama.name || '',
    descripcion: backendRama.sectionDescription || backendRama.description,
    icono: iconUrl || '', // URL de la imagen o vacío
    edadMinima: backendRama.minAge || 0,
    edadMaxima: backendRama.maxAge || 0,
    año: new Date().getFullYear(), // Por defecto el año actual
    estado: 'activa' as const,
    fechaCreacion: backendRama.createdAt || new Date().toISOString().split('T')[0],
    subramas: [] // Se cargan por separado
  };
  
=======

// Mapear datos del backend a formato frontend para Ramas
export const mapBackendRamaToFrontend = (backendRama: BackendRama): Rama => {
  // 🔍 LOG DETALLADO: Ver qué campos exactos recibimos del backend
  console.log('🔄 [Mapper] Input del backend completo:', JSON.stringify(backendRama, null, 2));
  
  // Usar los campos reales que retorna el backend
  const sectionId = String(backendRama.sectionId || backendRama.id || '');

  // Usar las URLs directas que retorna el backend
  const iconUrl = backendRama.iconObjectUrl || '';
  const photoPrincipalUrl = backendRama.photoPrincipalUrl || '';
  const galleryUrls = backendRama.galleryObjectUrls || [];

  // 🔍 LOG DETALLADO: Ver qué URLs exactas estamos extrayendo
  console.log('🔍 [Mapper] URLs extraídas:');
  console.log('   - iconUrl:', iconUrl);
  console.log('   - photoPrincipalUrl:', photoPrincipalUrl);
  console.log('   - galleryUrls:', galleryUrls);

  const mappedRama = {
    // Campos del backend
    section_id: sectionId,
    sectionName: backendRama.name || '',
    sectionDescription: backendRama.description || '',
    sectionGalleryObjectIds: galleryUrls,
    
    // Mapeo para retrocompatibilidad con el frontend
    id: sectionId, // CRÍTICO: Este debe tener valor
    nombre: backendRama.name || '',
    descripcion: backendRama.description || '',
    icono: iconUrl, // URL directa del backend
    iconoObjectId: '', // No se usa con URLs directas
    imagenPrincipal: photoPrincipalUrl, // URL directa del backend
    imagenPrincipalObjectId: '', // No se usa con URLs directas
    edadMinima: backendRama.minAge || 7,
    edadMaxima: backendRama.maxAge || 10,
    año: new Date().getFullYear(), // Por defecto el año actual
    estado: 'activa' as const,
    fechaCreacion: backendRama.createdAt ? backendRama.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    subramas: [] // Se cargan por separado
  };
  
  console.log('🔄 [Mapper] Rama mapeada final:', { 
    backend: { name: backendRama.name, sectionId: backendRama.sectionId },
    frontend: { nombre: mappedRama.nombre, id: mappedRama.id, icono: mappedRama.icono, imagenPrincipal: mappedRama.imagenPrincipal }
  });
  
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  return mappedRama;
};

// Mapear datos del backend a formato frontend para Subramas
export const mapBackendSubramaToFrontend = (backendSubrama: BackendSubrama): Subrama => {
<<<<<<< HEAD
=======
  // 🔍 LOG DETALLADO: Ver qué campos exactos recibimos del backend para subramas
  console.log('🔄 [Mapper] Input del backend para SUBRAMA:', JSON.stringify(backendSubrama, null, 2));
  
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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

<<<<<<< HEAD
  return {
=======
  // 🔍 CRÍTICO: Extraer URLs de imágenes (igual que en mapBackendRamaToFrontend)
  const iconUrl = backendSubrama.iconObjectUrl || '';
  const photoPrincipalUrl = backendSubrama.photoPrincipalUrl || '';
  const galleryUrls = backendSubrama.galleryObjectUrls || [];

  // 🔍 LOG DETALLADO: Ver qué URLs estamos extrayendo para subramas
  console.log('🔍 [Mapper] URLs extraídas para SUBRAMA:');
  console.log('   - iconUrl:', iconUrl);
  console.log('   - photoPrincipalUrl:', photoPrincipalUrl);
  console.log('   - galleryUrls:', galleryUrls);

  const mappedSubrama = {
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    // Si el backend provee un identificador canonical, úsalo; si no, usar el id consistente generado
    subgroup_id: extractedId ?? consistentId,
    subgroupName: nameFromBackend,
    subgroupDescription: backendSubrama.subgroupDescription || backendSubrama.subgroup_description || backendSubrama.description,
<<<<<<< HEAD
=======
    subgroupGalleryObjectIds: galleryUrls, // ✨ AGREGAR URLs de galería 
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    section_id: backendSubrama.section_id || backendSubrama.sectionId || '',
    // Mapeo para retrocompatibilidad con el frontend
    id: consistentId,
    nombre: nameFromBackend,
    descripcion: backendSubrama.subgroupDescription || backendSubrama.subgroup_description || backendSubrama.description,
<<<<<<< HEAD
=======
    icono: iconUrl, // URL directa del backend
    iconoObjectId: '', // No se usa con URLs directas
    imagenPrincipal: photoPrincipalUrl, // URL directa del backend
    imagenPrincipalObjectId: '', // No se usa con URLs directas
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    ramaId: backendSubrama.section_id || backendSubrama.sectionId || '', // Mapear section_id a ramaId
    lider: backendSubrama.leader || backendSubrama.leaderName || '',
    estado: (backendSubrama.isActive === false || backendSubrama.status === 'inactive') ? 'inactiva' as const : 'activa' as const,
    fechaCreacion: backendSubrama.createdAt || new Date().toISOString().split('T')[0],
    numeroMiembros: backendSubrama.memberCount || backendSubrama.members || 0
  };
<<<<<<< HEAD
};

// Mapear datos del frontend al formato que espera el backend para crear Ramas
export const mapFrontendCreateRamaToBackend = async (frontendData: CreateRamaData): Promise<CreateRamaBackendData> => {
  const { StorageService } = await import('../services/storage.service');
  
  let iconObjectId: string | null = null;
  let galleryObjectIds: string[] = [];

  if (frontendData.iconFile) {
    const result = await StorageService.uploadImage(frontendData.iconFile);
    iconObjectId = result.objectId;
  }

  if (frontendData.galleryFiles && frontendData.galleryFiles.length > 0) {
    galleryObjectIds = await StorageService.uploadMultipleImages(frontendData.galleryFiles);
  }

  return {
    name: frontendData.nombre,
    description: frontendData.descripcion,
    iconObjectId,
    galleryObjectIds
=======

  console.log('🔄 [Mapper] Subrama mapeada final:', { 
    backend: { name: backendSubrama.subgroupName, subgroupId: backendSubrama.subgroup_id || backendSubrama.subgroupId },
    frontend: { 
      nombre: mappedSubrama.nombre, 
      id: mappedSubrama.id, 
      icono: mappedSubrama.icono, 
      imagenPrincipal: mappedSubrama.imagenPrincipal,
      galleryCount: mappedSubrama.subgroupGalleryObjectIds?.length || 0
    }
  });

  return mappedSubrama;
};

// Mapear datos del frontend al formato que espera el backend para crear Ramas
export const mapFrontendCreateRamaToBackend = (frontendData: CreateRamaData): CreateRamaBackendData => {
  // Según las instrucciones: las imágenes van como null y [] por ahora
  return {
    name: frontendData.nombre,
    description: frontendData.descripcion,
    iconObjectId: null,        // Según instrucciones del backend
    galleryObjectIds: []       // Según instrucciones del backend
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Ramas
<<<<<<< HEAD
export const mapFrontendUpdateRamaToBackend = async (frontendData: UpdateRamaData): Promise<UpdateRamaBackendData> => {
  const { StorageService } = await import('../services/storage.service');
=======
export const mapFrontendUpdateRamaToBackend = (frontendData: UpdateRamaData): UpdateRamaBackendData => {
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  const backendData: UpdateRamaBackendData = {};
  
  if (frontendData.nombre !== undefined) {
    backendData.name = frontendData.nombre;
  }
  
  if (frontendData.descripcion !== undefined) {
    backendData.description = frontendData.descripcion;
  }
  
<<<<<<< HEAD
  // Manejar nuevo icono si se proporciona
  if (frontendData.iconFile) {
    const result = await StorageService.uploadImage(frontendData.iconFile);
    backendData.iconObjectId = result.objectId;
  } else {
    backendData.iconObjectId = null;
  }

  // Manejar nuevas imágenes de galería si se proporcionan
  if (frontendData.galleryFiles && frontendData.galleryFiles.length > 0) {
    backendData.galleryObjectIds = await StorageService.uploadMultipleImages(frontendData.galleryFiles);
  } else {
    backendData.galleryObjectIds = [];
  }
=======
  // Según las instrucciones: las imágenes van como null y [] por ahora
  backendData.iconObjectId = null;
  backendData.galleryObjectIds = [];
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  
  return backendData;
};

// Mapear datos del frontend al formato que espera el backend para crear Subramas
<<<<<<< HEAD
export const mapFrontendCreateSubramaToBackend = async (frontendData: CreateSubramaData): Promise<CreateSubramaBackendData> => {
  const { StorageService } = await import('../services/storage.service');
  
  let galleryObjectIds: string[] = [];

  if (frontendData.galleryFiles && frontendData.galleryFiles.length > 0) {
    galleryObjectIds = await StorageService.uploadMultipleImages(frontendData.galleryFiles);
  }

  return {
    name: frontendData.nombre,
    description: frontendData.descripcion,
    galleryObjectIds,
=======
export const mapFrontendCreateSubramaToBackend = (frontendData: CreateSubramaData): CreateSubramaBackendData => {
  return {
    name: frontendData.nombre,
    description: frontendData.descripcion,
    galleryObjectIds: [],     // Según instrucciones del backend
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    isActive: true
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Subramas
export const mapFrontendUpdateSubramaToBackend = (frontendData: UpdateSubramaData): UpdateSubramaBackendData => {
  const backendData: UpdateSubramaBackendData = {};
  
  if (frontendData.nombre !== undefined) {
    backendData.name = frontendData.nombre;
  }
  
  if (frontendData.descripcion !== undefined) {
    backendData.description = frontendData.descripcion;
  }
  
  // Siempre incluir estos campos según las instrucciones  
  backendData.galleryObjectIds = [];
  backendData.isActive = frontendData.estado === 'activa';
  
  return backendData;
};
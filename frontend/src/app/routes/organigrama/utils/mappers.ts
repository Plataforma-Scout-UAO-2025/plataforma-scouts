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
  
  return mappedRama;
};

// Mapear datos del backend a formato frontend para Subramas
export const mapBackendSubramaToFrontend = (backendSubrama: BackendSubrama): Subrama => {
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

  return {
    // Si el backend provee un identificador canonical, úsalo; si no, usar el id consistente generado
    subgroup_id: extractedId ?? consistentId,
    subgroupName: nameFromBackend,
    subgroupDescription: backendSubrama.subgroupDescription || backendSubrama.subgroup_description || backendSubrama.description,
    section_id: backendSubrama.section_id || backendSubrama.sectionId || '',
    // Mapeo para retrocompatibilidad con el frontend
    id: consistentId,
    nombre: nameFromBackend,
    descripcion: backendSubrama.subgroupDescription || backendSubrama.subgroup_description || backendSubrama.description,
    ramaId: backendSubrama.section_id || backendSubrama.sectionId || '', // Mapear section_id a ramaId
    lider: backendSubrama.leader || backendSubrama.leaderName || '',
    estado: (backendSubrama.isActive === false || backendSubrama.status === 'inactive') ? 'inactiva' as const : 'activa' as const,
    fechaCreacion: backendSubrama.createdAt || new Date().toISOString().split('T')[0],
    numeroMiembros: backendSubrama.memberCount || backendSubrama.members || 0
  };
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
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Ramas
export const mapFrontendUpdateRamaToBackend = async (frontendData: UpdateRamaData): Promise<UpdateRamaBackendData> => {
  const { StorageService } = await import('../services/storage.service');
  const backendData: UpdateRamaBackendData = {};
  
  if (frontendData.nombre !== undefined) {
    backendData.name = frontendData.nombre;
  }
  
  if (frontendData.descripcion !== undefined) {
    backendData.description = frontendData.descripcion;
  }
  
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
  
  return backendData;
};

// Mapear datos del frontend al formato que espera el backend para crear Subramas
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
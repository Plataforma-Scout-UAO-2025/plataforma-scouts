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
  UpdateSubramaBackendData
} from '../types/rama.type';

// Mapear datos del backend a formato frontend para Ramas
export const mapBackendRamaToFrontend = (backendRama: any): Rama => {
  console.log('🔍 [Mapper] Raw backend data:', backendRama);
  
  // Intentar diferentes posibles nombres de campo para el ID
  const possibleId = backendRama.section_id || 
                     backendRama.id || 
                     backendRama.sectionId || 
                     backendRama.ID || 
                     backendRama.Section_ID;
                     
  console.log('🔍 [Mapper] Extracted ID:', possibleId);
  
  const mappedRama = {
    section_id: possibleId,
    sectionName: backendRama.sectionName || backendRama.name || '',
    sectionDescription: backendRama.sectionDescription || backendRama.description,
    sectionGalleryObjectIds: backendRama.sectionGalleryObjectIds || [],
    // Mapeo para retrocompatibilidad con el frontend
    id: possibleId, // CRÍTICO: Este debe tener valor
    nombre: backendRama.sectionName || backendRama.name || '',
    descripcion: backendRama.sectionDescription || backendRama.description,
    icono: '', // No viene del backend
    edadMinima: backendRama.minAge || 0,
    edadMaxima: backendRama.maxAge || 0,
    año: new Date().getFullYear(), // Por defecto el año actual
    estado: 'activa' as const,
    fechaCreacion: backendRama.createdAt || new Date().toISOString().split('T')[0],
    subramas: [] // Se cargan por separado
  };
  
  console.log('✅ [Mapper] Mapped rama:', mappedRama);
  return mappedRama;
};

// Mapear datos del backend a formato frontend para Subramas
export const mapBackendSubramaToFrontend = (backendSubrama: any): Subrama => {
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
  const consistentId = !hasBackendId ? generateConsistentId() : extractedId as string;

  return {
    // Si el backend provee un identificador canonical, úsalo para BOTH id y subgroup_id.
    // Esto evita que el frontend use un ID generado cuando el backend ya tiene uno real.
    subgroup_id: extractedId ?? '',
    subgroupName: backendSubrama.subgroupName || '',
    subgroupDescription: backendSubrama.subgroupDescription,
    section_id: backendSubrama.section_id || backendSubrama.sectionId || '',
    // Mapeo para retrocompatibilidad con el frontend
    id: consistentId, // Será el ID canonical si existe, o un ID consistente generado en su defecto
    nombre: backendSubrama.subgroupName || '',
    descripcion: backendSubrama.subgroupDescription,
    ramaId: backendSubrama.section_id || backendSubrama.sectionId || '', // Mapear section_id a ramaId
    lider: backendSubrama.leader || '',
    estado: 'activa' as const,
    fechaCreacion: backendSubrama.createdAt || new Date().toISOString().split('T')[0],
    numeroMiembros: backendSubrama.memberCount || 0
  };
};

// Mapear datos del frontend al formato que espera el backend para crear Ramas
export const mapFrontendCreateRamaToBackend = (frontendData: CreateRamaData): CreateRamaBackendData => {
  return {
    sectionName: frontendData.nombre,
    sectionDescription: frontendData.descripcion,
    sectionGalleryObjectIds: []
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Ramas
export const mapFrontendUpdateRamaToBackend = (frontendData: UpdateRamaData): UpdateRamaBackendData => {
  const backendData: UpdateRamaBackendData = {};
  
  if (frontendData.nombre !== undefined) {
    backendData.sectionName = frontendData.nombre;
  }
  
  if (frontendData.descripcion !== undefined) {
    backendData.sectionDescription = frontendData.descripcion;
  }
  
  return backendData;
};

// Mapear datos del frontend al formato que espera el backend para crear Subramas
export const mapFrontendCreateSubramaToBackend = (frontendData: CreateSubramaData): CreateSubramaBackendData => {
  return {
    subgroupName: frontendData.nombre,
    subgroupDescription: frontendData.descripcion
  };
};

// Mapear datos del frontend al formato que espera el backend para actualizar Subramas
export const mapFrontendUpdateSubramaToBackend = (frontendData: UpdateSubramaData): UpdateSubramaBackendData => {
  const backendData: UpdateSubramaBackendData = {};
  
  if (frontendData.nombre !== undefined) {
    backendData.subgroupName = frontendData.nombre;
  }
  
  if (frontendData.descripcion !== undefined) {
    backendData.subgroupDescription = frontendData.descripcion;
  }
  
  return backendData;
};
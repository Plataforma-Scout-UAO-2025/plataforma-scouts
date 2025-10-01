import type { 
  Rama, 
  CreateRamaData, 
  UpdateRamaData, 
  CreateSubramaData, 
  UpdateSubramaData, 
  Subrama 
} from '../types/rama.type';

import {
  mockGetRamas,
  mockGetRamaById,
  mockCreateRama,
  mockUpdateRama,
  mockDeleteRama,
  mockGetSubramasByRamaId,
  mockGetSubramaById,
  mockCreateSubrama,
  mockUpdateSubrama,
  mockDeleteSubrama,
  clearStorageData
} from './organigrama.mock.service';

// Interruptor para alternar entre API real y simulación
const USE_MOCK_API = true;

// CRUD para Ramas (SECTIONS)
export const getRamas = async (tenantSlug: string, groupSlug: string, año?: number): Promise<Rama[]> => {
  if (USE_MOCK_API) {
    console.log('��� [OrganigramaService] Modo simulación activado');
    return await mockGetRamas(tenantSlug, groupSlug, año);
  } else {
    console.log('��� [OrganigramaService] Modo real activado');
    return [];
  }
};

export const getRamaById = async (tenantSlug: string, groupSlug: string, id: string): Promise<Rama | null> => {
  if (USE_MOCK_API) {
    return await mockGetRamaById(tenantSlug, groupSlug, id);
  } else {
    return null;
  }
};

export const createRama = async (tenantSlug: string, groupSlug: string, data: CreateRamaData): Promise<Rama> => {
  if (USE_MOCK_API) {
    return await mockCreateRama(data);
  } else {
    throw new Error('API real no implementada');
  }
};

export const updateRama = async (tenantSlug: string, groupSlug: string, data: UpdateRamaData): Promise<Rama | null> => {
  if (USE_MOCK_API) {
    return await mockUpdateRama(data.id, data);
  } else {
    return null;
  }
};

export const deleteRama = async (tenantSlug: string, groupSlug: string, id: string): Promise<boolean> => {
  if (USE_MOCK_API) {
    try {
      await mockDeleteRama(id);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};

// CRUD para Subramas (SUBGROUPS)
export const getSubramasByRamaId = async (tenantSlug: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  if (USE_MOCK_API) {
    return await mockGetSubramasByRamaId(tenantSlug, groupSlug, ramaId);
  } else {
    return [];
  }
};

export const getSubramaById = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  if (USE_MOCK_API) {
    return await mockGetSubramaById(tenantSlug, groupSlug, sectionId, id);
  } else {
    return null;
  }
};

export const createSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  if (USE_MOCK_API) {
    return await mockCreateSubrama(sectionId, data);
  } else {
    return null;
  }
};

export const updateSubrama = async (tenantSlug: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  if (USE_MOCK_API) {
    if (!data.ramaId) {
      throw new Error('ramaId es requerido para actualizar subrama');
    }
    return await mockUpdateSubrama(data.ramaId, data.id, data);
  } else {
    return null;
  }
};

export const deleteSubrama = async (tenantSlug: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  if (USE_MOCK_API) {
    try {
      await mockDeleteSubrama(sectionId, id);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};

// Funciones auxiliares
export const getAvailableYears = async (tenantSlug: string, groupSlug: string): Promise<number[]> => {
  if (USE_MOCK_API) {
    const ramas = await mockGetRamas(tenantSlug, groupSlug);
    const years = [...new Set(ramas.map(rama => rama.año).filter(año => año !== undefined && año !== null))];
    return years.sort((a, b) => b - a);
  } else {
    return [];
  }
};

// Funciones de carga de archivos (simuladas)
export const uploadSectionIcon = async (
  _tenantSlug: string,
  _groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  if (USE_MOCK_API) {
    console.log('📤 [MockService] Subiendo icono de sección...');
    
    try {
      // Usar StorageService para manejar la persistencia real
      const { StorageService } = await import('./storage.service');
      const objectId = await StorageService.uploadRamaIcon(file, sectionId);
      
      console.log('✅ [MockService] Icono de sección subido con éxito:', objectId);
      return objectId;
    } catch (error) {
      console.error('❌ [MockService] Error subiendo icono:', error);
      throw error;
    }
  }

  // TODO: Implementar upload real cuando se conecte con el backend
  throw new Error('Real API not implemented yet');
};

export const uploadSectionMainImage = async (
  _tenantSlug: string,
  _groupSlug: string,
  sectionId: string,
  file: File
): Promise<string> => {
  if (USE_MOCK_API) {
    console.log('📤 [MockService] Subiendo imagen principal de sección...');
    
    try {
      // Usar StorageService para manejar la persistencia real
      const { StorageService } = await import('./storage.service');
      const objectId = await StorageService.uploadRamaMainImage(file, sectionId);
      
      console.log('✅ [MockService] Imagen principal de sección subida con éxito:', objectId);
      return objectId;
    } catch (error) {
      console.error('❌ [MockService] Error subiendo imagen principal:', error);
      throw error;
    }
  }

  // TODO: Implementar upload real cuando se conecte con el backend
  throw new Error('Real API not implemented yet');
};

export const uploadSubgroupIcon = async (
  tenantSlug: string,
  groupSlug: string, 
  sectionId: string,
  subgroupId: string,
  file: File
): Promise<string> => {
  if (USE_MOCK_API) {
    console.log('🎭 [OrganigramaService] Simulando carga de icono de subgrupo:', file.name);
    // Simular delay de carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Retornar URL simulada
    return `https://mock-storage.com/subgroup-icons/${sectionId}/${subgroupId}/${file.name}`;
  } else {
    // TODO: Implementar carga real
    throw new Error('Carga de archivos no implementada para API real');
  }
};

export const uploadGalleryImages = async (
  _tenantSlug: string,
  _groupSlug: string,
  sectionId: string,
  files: File[]
): Promise<string[]> => {
  if (USE_MOCK_API) {
    console.log('📤 [MockService] Subiendo imágenes de galería...');
    
    try {
      // Usar StorageService para manejar la persistencia real
      const { StorageService } = await import('./storage.service');
      const objectIds = await StorageService.uploadRamaGallery(files, sectionId);
      
      // Devolver las URLs para mostrar inmediatamente
      const urls = objectIds.map(id => StorageService.getImageUrl(id)).filter(url => url !== null) as string[];
      
      console.log('✅ [MockService] Imágenes de galería subidas con éxito:', urls.length);
      return urls;
    } catch (error) {
      console.error('❌ [MockService] Error subiendo galería:', error);
      throw error;
    }
  }

  // TODO: Implementar upload real cuando se conecte con el backend
  throw new Error('Real API not implemented yet');
};

export const uploadSubgroupGalleryImages = async (
  _tenantSlug: string,
  _groupSlug: string,
  _sectionId: string,
  _subgroupId: string,
  _files: File[]
): Promise<string[]> => {
  if (USE_MOCK_API) {
    // Simular upload con delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar URLs mock para cada imagen
    const urls = _files.map((_, index) => `https://mock-api.example.com/images/subgroup-gallery-${_subgroupId}-${index + 1}.jpg`);
    
    console.log('📸 [MockService] Subgroup gallery images simuladas:', urls);
    return urls;
  }

  // TODO: Implementar upload real cuando se conecte con el backend
  throw new Error('Real API not implemented yet');
};

// 🧹 Función para limpiar localStorage (útil para debugging)
export const clearAllStorageData = (): void => {
  if (USE_MOCK_API) {
    clearStorageData();
  } else {
    console.warn('clearAllStorageData solo funciona en modo mock');
  }
};

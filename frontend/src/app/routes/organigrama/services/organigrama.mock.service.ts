import { v4 as uuidv4 } from 'uuid';
import type { 
  Rama, 
  CreateRamaData, 
  UpdateRamaData, 
  Subrama, 
  CreateSubramaData, 
  UpdateSubramaData 
} from '../types/rama.type';
import { mockRamas } from '../constants/mockData';

// 🗂️ Claves de almacenamiento en localStorage
const RAMAS_STORAGE_KEY = 'organigrama_ramas';
const SUBRAMAS_STORAGE_KEY = 'organigrama_subramas';

// 📦 Funciones de persistencia para Ramas
const getStoredRamas = (): Rama[] => {
  try {
    const stored = localStorage.getItem(RAMAS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('⚠️ [MockService] Error leyendo ramas del localStorage:', error);
    return [];
  }
};

const saveStoredRamas = (ramas: Rama[]): void => {
  try {
    localStorage.setItem(RAMAS_STORAGE_KEY, JSON.stringify(ramas));
    console.log('💾 [MockService] Ramas guardadas en localStorage:', ramas.length);
  } catch (error) {
    console.error('❌ [MockService] Error guardando ramas en localStorage:', error);
  }
};

// 📦 Funciones de persistencia para Subramas
const getStoredSubramas = (): Subrama[] => {
  try {
    const stored = localStorage.getItem(SUBRAMAS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('⚠️ [MockService] Error leyendo subramas del localStorage:', error);
    return [];
  }
};

const saveStoredSubramas = (subramas: Subrama[]): void => {
  try {
    localStorage.setItem(SUBRAMAS_STORAGE_KEY, JSON.stringify(subramas));
    console.log('💾 [MockService] Subramas guardadas en localStorage:', subramas.length);
  } catch (error) {
    console.error('❌ [MockService] Error guardando subramas en localStorage:', error);
  }
};

// 🔄 Función para simular delay de red (opcional)
const simulateNetworkDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 🧹 Función auxiliar para limpiar datos corruptos en localStorage
export const clearStorageData = (): void => {
  console.log('🧹 [MockService] Limpiando todos los datos del localStorage');
  localStorage.removeItem(RAMAS_STORAGE_KEY);
  localStorage.removeItem(SUBRAMAS_STORAGE_KEY);
  
  // También limpiar otros datos relacionados con imágenes y organigrama
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('organigrama_') || key.startsWith('rama_') || key.startsWith('image_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('✅ [MockService] Datos de localStorage limpiados');
};

// 🏗️ CRUD SIMULADO PARA RAMAS

export const mockGetRamas = async (_tenantSlug?: string, _groupSlug?: string, año?: number): Promise<Rama[]> => {
  await simulateNetworkDelay();
  
  console.log('🔍 [MockService] Obteniendo ramas del localStorage');
  
  let ramas = getStoredRamas();
  
  // Limpiar datos corruptos - filtrar ramas que no tengan año definido
  ramas = ramas.filter(rama => rama.año !== undefined && rama.año !== null && typeof rama.año === 'number');
  
  // Si no hay ramas almacenadas válidas, inicializar con datos mock
  if (ramas.length === 0) {
    console.log('🎯 [MockService] Inicializando con datos mock por primera vez');
    ramas = mockRamas;
    saveStoredRamas(ramas);
  }
  
  // Cargar las URLs de las imágenes para cada rama
  const { StorageService } = await import('./storage.service');
  ramas = ramas.map(rama => {
    // Cargar icono
    if (rama.iconoObjectId) {
      const imageUrl = StorageService.getImageUrl(rama.iconoObjectId);
      if (imageUrl) {
        rama.icono = imageUrl;
      }
    }
    
    // Cargar imagen principal
    if (rama.imagenPrincipalObjectId) {
      const mainImageUrl = StorageService.getImageUrl(rama.imagenPrincipalObjectId);
      if (mainImageUrl) {
        rama.imagenPrincipal = mainImageUrl;
      }
    }
    
    return rama;
  });
  
  // Filtrar por año si se especifica
  const filteredRamas = año ? ramas.filter(rama => rama.año === año) : ramas;
  
  console.log(`✅ [MockService] Ramas obtenidas: ${filteredRamas.length} (filtradas por año: ${año || 'todos'})`);
  return filteredRamas;
};

export const mockGetRamaById = async (_tenantSlug: string, _groupSlug: string, id: string): Promise<Rama | null> => {
  await simulateNetworkDelay();
  
  console.log('🔍 [MockService] Buscando rama por ID:', id);
  
  const ramas = getStoredRamas();
  const rama = ramas.find(r => r.id === id);
  
  if (rama) {
    // Cargar la URL de la imagen si existe un iconoObjectId
    if (rama.iconoObjectId) {
      const { StorageService } = await import('./storage.service');
      const imageUrl = StorageService.getImageUrl(rama.iconoObjectId);
      if (imageUrl) {
        rama.icono = imageUrl;
      }
    }
    
    // Cargar la URL de la imagen principal si existe
    if (rama.imagenPrincipalObjectId) {
      const { StorageService } = await import('./storage.service');
      const mainImageUrl = StorageService.getImageUrl(rama.imagenPrincipalObjectId);
      if (mainImageUrl) {
        rama.imagenPrincipal = mainImageUrl;
      }
    }
    
    console.log('✅ [MockService] Rama encontrada:', rama.nombre);
    return rama;
  } else {
    console.warn('⚠️ [MockService] Rama no encontrada con ID:', id);
    return null;
  }
};

export const mockCreateRama = async (data: CreateRamaData): Promise<Rama> => {
  await simulateNetworkDelay();
  
  console.log('🆕 [MockService] Creando nueva rama:', data.nombre);
  
  const ramas = getStoredRamas();
  const now = new Date().toISOString();
  const uniqueId = uuidv4();
  
  const newRama: Rama = {
    id: uniqueId,
    section_id: uniqueId, // Usar el mismo UUID como string
    sectionName: data.nombre,
    nombre: data.nombre,
    sectionDescription: data.descripcion,
    descripcion: data.descripcion,
    sectionGalleryObjectIds: [],
    icono: '', // Se manejará con el StorageService si hay archivos
    edadMinima: data.edadMinima,
    edadMaxima: data.edadMaxima,
    año: data.año,
    estado: 'activa',
    fechaCreacion: now,
    subramas: []
  };
  
  ramas.push(newRama);
  saveStoredRamas(ramas);
  
  console.log('✅ [MockService] Rama creada exitosamente:', newRama.id);
  return newRama;
};

export const mockUpdateRama = async (id: string, data: UpdateRamaData): Promise<Rama> => {
  await simulateNetworkDelay();
  
  console.log('✏️ [MockService] Actualizando rama:', id);
  
  const ramas = getStoredRamas();
  const ramaIndex = ramas.findIndex(r => r.id === id);
  
  if (ramaIndex === -1) {
    throw new Error(`Rama con ID ${id} no encontrada`);
  }
  
  const updatedRama: Rama = {
    ...ramas[ramaIndex],
    ...(data.nombre && { nombre: data.nombre, sectionName: data.nombre }),
    ...(data.descripcion && { descripcion: data.descripcion, sectionDescription: data.descripcion }),
    ...(data.edadMinima && { edadMinima: data.edadMinima }),
    ...(data.edadMaxima && { edadMaxima: data.edadMaxima }),
    ...(data.estado && { estado: data.estado })
  };
  
  ramas[ramaIndex] = updatedRama;
  saveStoredRamas(ramas);
  
  console.log('✅ [MockService] Rama actualizada exitosamente:', updatedRama.id);
  return updatedRama;
};

export const mockDeleteRama = async (id: string): Promise<void> => {
  await simulateNetworkDelay();
  
  console.log('🗑️ [MockService] Eliminando rama:', id);
  
  const ramas = getStoredRamas();
  const filteredRamas = ramas.filter(r => r.id !== id);
  
  if (ramas.length === filteredRamas.length) {
    throw new Error(`Rama con ID ${id} no encontrada`);
  }
  
  saveStoredRamas(filteredRamas);
  
  // También eliminar todas las subramas asociadas
  const subramas = getStoredSubramas();
  const filteredSubramas = subramas.filter(s => s.ramaId !== id);
  saveStoredSubramas(filteredSubramas);
  
  console.log('✅ [MockService] Rama eliminada exitosamente:', id);
};

// 🏗️ CRUD SIMULADO PARA SUBRAMAS

export const mockGetSubramasByRamaId = async (_tenantSlug: string, _groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  await simulateNetworkDelay();
  
  console.log('🔍 [MockService] Obteniendo subramas para rama:', ramaId);
  
  const subramas = getStoredSubramas();
  const subramasDeRama = subramas.filter(s => s.ramaId === ramaId);
  
  console.log(`✅ [MockService] Subramas obtenidas: ${subramasDeRama.length} para rama ${ramaId}`);
  return subramasDeRama;
};

export const mockGetSubramaById = async (_tenantSlug: string, _groupSlug: string, ramaId: string, subramaId: string): Promise<Subrama | null> => {
  await simulateNetworkDelay();
  
  console.log('🔍 [MockService] Buscando subrama por ID:', subramaId);
  
  const subramas = getStoredSubramas();
  const subrama = subramas.find(s => s.id === subramaId && s.ramaId === ramaId);
  
  if (subrama) {
    console.log('✅ [MockService] Subrama encontrada:', subrama.nombre);
    return subrama;
  } else {
    console.warn('⚠️ [MockService] Subrama no encontrada con ID:', subramaId);
    return null;
  }
};

export const mockCreateSubrama = async (ramaId: string, data: CreateSubramaData): Promise<Subrama> => {
  await simulateNetworkDelay();
  
  console.log('🆕 [MockService] Creando nueva subrama:', data.nombre);
  
  const subramas = getStoredSubramas();
  const now = new Date().toISOString();
  const uniqueId = uuidv4();
  
  const newSubrama: Subrama = {
    id: uniqueId,
    subgroup_id: uniqueId, // Usar el mismo UUID como string
    subgroupName: data.nombre,
    nombre: data.nombre,
    subgroupDescription: data.descripcion,
    descripcion: data.descripcion,
    section_id: ramaId,
    icono: '', // Se manejará con StorageService si hay archivos
    ramaId: ramaId,
    lider: data.lider,
    estado: 'activa',
    fechaCreacion: now,
    numeroMiembros: 0
  };
  
  subramas.push(newSubrama);
  saveStoredSubramas(subramas);
  
  // También actualizar la rama padre para incluir la subrama
  const ramas = getStoredRamas();
  const ramaIndex = ramas.findIndex(r => r.id === ramaId);
  if (ramaIndex !== -1) {
    ramas[ramaIndex].subramas.push(newSubrama);
    saveStoredRamas(ramas);
  }
  
  console.log('✅ [MockService] Subrama creada exitosamente:', newSubrama.id);
  return newSubrama;
};

export const mockUpdateSubrama = async (ramaId: string, subramaId: string, data: UpdateSubramaData): Promise<Subrama> => {
  await simulateNetworkDelay();
  
  console.log('✏️ [MockService] Actualizando subrama:', subramaId);
  
  const subramas = getStoredSubramas();
  const subramaIndex = subramas.findIndex(s => s.id === subramaId && s.ramaId === ramaId);
  
  if (subramaIndex === -1) {
    throw new Error(`Subrama con ID ${subramaId} no encontrada en rama ${ramaId}`);
  }
  
  const updatedSubrama: Subrama = {
    ...subramas[subramaIndex],
    ...(data.nombre && { nombre: data.nombre, subgroupName: data.nombre }),
    ...(data.descripcion && { descripcion: data.descripcion, subgroupDescription: data.descripcion }),
    ...(data.lider && { lider: data.lider }),
    ...(data.estado && { estado: data.estado })
  };
  
  subramas[subramaIndex] = updatedSubrama;
  saveStoredSubramas(subramas);
  
  // También actualizar en la rama padre
  const ramas = getStoredRamas();
  const ramaIndex = ramas.findIndex(r => r.id === ramaId);
  if (ramaIndex !== -1) {
    const subramaIndexInRama = ramas[ramaIndex].subramas.findIndex(s => s.id === subramaId);
    if (subramaIndexInRama !== -1) {
      ramas[ramaIndex].subramas[subramaIndexInRama] = updatedSubrama;
      saveStoredRamas(ramas);
    }
  }
  
  console.log('✅ [MockService] Subrama actualizada exitosamente:', updatedSubrama.id);
  return updatedSubrama;
};

export const mockDeleteSubrama = async (ramaId: string, subramaId: string): Promise<void> => {
  await simulateNetworkDelay();
  
  console.log('🗑️ [MockService] Eliminando subrama:', subramaId);
  
  const subramas = getStoredSubramas();
  const filteredSubramas = subramas.filter(s => !(s.id === subramaId && s.ramaId === ramaId));
  
  if (subramas.length === filteredSubramas.length) {
    throw new Error(`Subrama con ID ${subramaId} no encontrada en rama ${ramaId}`);
  }
  
  saveStoredSubramas(filteredSubramas);
  
  // También eliminar de la rama padre
  const ramas = getStoredRamas();
  const ramaIndex = ramas.findIndex(r => r.id === ramaId);
  if (ramaIndex !== -1) {
    ramas[ramaIndex].subramas = ramas[ramaIndex].subramas.filter(s => s.id !== subramaId);
    saveStoredRamas(ramas);
  }
  
  console.log('✅ [MockService] Subrama eliminada exitosamente:', subramaId);
};

// 🧹 Función utilitaria para limpiar datos de desarrollo
export const clearMockData = (): void => {
  localStorage.removeItem(RAMAS_STORAGE_KEY);
  localStorage.removeItem(SUBRAMAS_STORAGE_KEY);
  console.log('🧹 [MockService] Datos mock limpiados del localStorage');
};

// 📊 Función utilitaria para obtener estadísticas
export const getMockDataStats = () => {
  const ramas = getStoredRamas();
  const subramas = getStoredSubramas();
  
  return {
    ramasCount: ramas.length,
    subramasCount: subramas.length,
    totalItems: ramas.length + subramas.length
  };
};
import type { 
  Branch as Rama, 
  CreateBranchData as CreateRamaData, 
  UpdateBranchData as UpdateRamaData, 
} from '../types/frontend';
import type { BackendBranch as BackendRama } from '../types/backend';

import { apiClient } from './apiClient';
import { 
  mapBackendRamaToFrontend, 
  mapFrontendCreateRamaToBackend, 
  mapFrontendUpdateRamaToBackend
} from '../utils/mappers';
import { getSubramasByRamaId } from './subrama.service';
import { uploadSectionIcon, uploadGalleryImages } from './image-upload-core.service';

// CRUD para Ramas (SECTIONS)
export const getRamas = async (tenantSlug: string, groupSlug: string, año?: number): Promise<Rama[]> => {
  console.log('🔄 [RamaService] Obteniendo ramas del backend real');
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    console.log('🔄 [RamaService] Haciendo request a:', endpoint);
    
    const backendRamas = await apiClient.get<BackendRama[]>(endpoint);
    
    // 🔍 LOG DETALLADO: Ver exactamente qué devuelve el backend
    console.log('📊 [Backend Response] Estructura completa recibida:');
    console.log('📊 [Backend Response] Cantidad de ramas:', backendRamas.length);
    if (backendRamas.length > 0) {
      console.log('📊 [Backend Response] Primera rama completa:', JSON.stringify(backendRamas[0], null, 2));
      console.log('📊 [Backend Response] Campos de imágenes en primera rama:');
      console.log('   - iconObjectUrl:', backendRamas[0].iconObjectUrl);
      console.log('   - photoPrincipalUrl:', backendRamas[0].photoPrincipalUrl);
      console.log('   - galleryObjectUrls:', backendRamas[0].galleryObjectUrls);
    }
    
    // Transformar datos del backend al formato frontend
    const ramas = backendRamas.map(mapBackendRamaToFrontend);
    
    // 🔄 PASO CRÍTICO: Hidratar cada rama con sus subramas
    console.log('🔄 [RamaService] Hidratando ramas con sus subramas...');
    const ramasConSubramas = await Promise.all(
      ramas.map(async (rama) => {
        try {
          const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, rama.id);
          return { ...rama, subramas };
        } catch (error) {
          console.warn(`⚠️ [RamaService] No se pudieron cargar subramas para rama ${rama.nombre ?? rama.name}:`, error);
          return { ...rama, subramas: [] };
        }
      })
    );
    
    // Filtrar por año si se especifica (soportando legacy 'año')
    const ramasFiltradas = año ? ramasConSubramas.filter((rama: Rama) => {
      const legacy = rama as unknown as Record<string, unknown>;
      const year = rama.year ?? (legacy['año'] as number | undefined);
      return year === año;
    }) : ramasConSubramas;
    
    console.log('✅ [RamaService] Ramas hidratadas con subramas:', ramasFiltradas.length);
    console.log('📊 [RamaService] Subramas totales:', ramasFiltradas.reduce((total, rama) => total + rama.subramas.length, 0));
    return ramasFiltradas;
  } catch (error) {
    console.error('❌ [RamaService] Error obteniendo ramas:', error);
    throw error;
  }
};

export const getRamaById = async (tenantSlug: string, groupSlug: string, id: string): Promise<Rama | null> => {
  console.log('🔄 [RamaService] Obteniendo rama por ID:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
    const backendRama = await apiClient.get<BackendRama>(endpoint);
    
    const rama = mapBackendRamaToFrontend(backendRama);
    
    // 🔄 Hidratar rama con sus subramas
    try {
      const subramas = await getSubramasByRamaId(tenantSlug, groupSlug, rama.id);
      rama.subramas = subramas;
      console.log('✅ [RamaService] Rama obtenida con', subramas.length, 'subramas:', rama.nombre);
    } catch (subramaError) {
      console.warn(`⚠️ [RamaService] No se pudieron cargar subramas para rama ${rama.nombre}:`, subramaError);
      rama.subramas = [];
    }
    
    return rama;
  } catch (error) {
    console.error('❌ [RamaService] Error obteniendo rama por ID:', error);
    return null;
  }
};

export const createRama = async (tenantSlug: string, groupSlug: string, data: CreateRamaData): Promise<Rama> => {
  const maybeData = data as unknown as Record<string, unknown>;
  console.log('🔄 [RamaService] Creando nueva rama:', (maybeData['nombre'] as string | undefined) ?? data.name);
  console.log('📝 [RamaService] Datos recibidos:', {
    nombre: (maybeData['nombre'] as string | undefined) ?? data.name,
    descripcion: (maybeData['descripcion'] as string | undefined) ?? data.description,
    tieneIconFile: !!data.iconFile,
    iconFileName: data.iconFile?.name,
    tieneGalleryFiles: !!data.galleryFiles && data.galleryFiles.length > 0
  });
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendCreateRamaToBackend(data);
    console.log('📤 [RamaService] Enviando al backend:', backendData);
    
    // Crear la rama
    const backendRama = await apiClient.post<BackendRama>(endpoint, backendData);
    
    // Extraer el ID de la sección creada (puede venir como sectionId o section_id)
    const sectionId = String(backendRama.sectionId || backendRama.section_id || backendRama.id || '');
    console.log('✅ [RamaService] Rama creada con ID:', sectionId);
    
    // Si hay archivos de imagen, subirlos después de crear la rama
    if (data.iconFile && sectionId) {
      console.log('🔄 [RamaService] Subiendo icono para la rama recién creada...');
      await uploadSectionIcon(tenantSlug, groupSlug, sectionId, data.iconFile);
      console.log('✅ [RamaService] Icono subido exitosamente');
    } else {
      console.log('ℹ️ [RamaService] No hay icono para subir o sectionId inválido');
    }
    
    if (data.galleryFiles && data.galleryFiles.length > 0 && sectionId) {
      console.log('🔄 [RamaService] Subiendo galería para la rama recién creada...');
      await uploadGalleryImages(tenantSlug, groupSlug, sectionId, data.galleryFiles);
      console.log('✅ [RamaService] Galería subida exitosamente');
    }
    
    // Obtener los datos actualizados de la rama después de subir las imágenes
    if (sectionId && (data.iconFile || (data.galleryFiles && data.galleryFiles.length > 0))) {
      console.log('🔄 [RamaService] Obteniendo datos actualizados de la rama después de subir imágenes...');
      const updatedRama = await getRamaById(tenantSlug, groupSlug, sectionId);
      if (updatedRama) {
        console.log('✅ [RamaService] Rama creada y actualizada con imágenes:', updatedRama.nombre);
        return updatedRama;
      }
    }
    
  const rama = mapBackendRamaToFrontend(backendRama);
    console.log('✅ [RamaService] Rama creada:', rama.nombre);
    return rama;
  } catch (error) {
    console.error('❌ [RamaService] Error creando rama:', error);
    throw error;
  }
};

export const updateRama = async (tenantSlug: string, groupSlug: string, data: UpdateRamaData): Promise<Rama | null> => {
  console.log('🔄 [RamaService] Actualizando rama:', data.id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${data.id}`;
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapFrontendUpdateRamaToBackend(data);
    
    // Actualizar la rama
    const backendRama = await apiClient.put<BackendRama>(endpoint, backendData);
    
    // Si hay archivos de imagen nuevos, subirlos
    if (data.iconFile) {
      await uploadSectionIcon(tenantSlug, groupSlug, data.id, data.iconFile);
    }
    
    if (data.galleryFiles && data.galleryFiles.length > 0) {
      await uploadGalleryImages(tenantSlug, groupSlug, data.id, data.galleryFiles);
    }
    
    const rama = mapBackendRamaToFrontend(backendRama);
    console.log('✅ [RamaService] Rama actualizada:', rama.nombre);
    return rama;
  } catch (error) {
    console.error('❌ [RamaService] Error actualizando rama:', error);
    throw error;
  }
};

export const deleteRama = async (tenantSlug: string, groupSlug: string, id: string): Promise<boolean> => {
  console.log('🔄 [RamaService] Eliminando rama:', id);
  
  try {
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections/${id}`;
    await apiClient.delete(endpoint);
    
    console.log('✅ [RamaService] Rama eliminada');
    return true;
  } catch (error) {
    console.error('❌ [RamaService] Error eliminando rama:', error);
    return false;
  }
};

// Función auxiliar para obtener años disponibles
export const getAvailableYears = async (tenantSlug: string, groupSlug: string): Promise<number[]> => {
  console.log('🔄 [RamaService] Obteniendo años disponibles - OPTIMIZADO');
  
  try {
    // OPTIMIZACIÓN: Solo obtenemos las ramas SIN subramas para calcular años
    // Esto evita el bucle infinito y mejora el rendimiento
    const endpoint = `/api/tenants/${tenantSlug}/groups/${groupSlug}/sections`;
    const backendRamas = await apiClient.get<BackendRama[]>(endpoint);
    
    // Extraer años directamente de los datos del backend sin mapear subramas
  const ramasSimples = backendRamas.map(mapBackendRamaToFrontend);
  const years = [...new Set(ramasSimples.map((r: Rama) => {
    const legacy = r as unknown as Record<string, unknown>;
    return r.year ?? (legacy['año'] as number | undefined);
  }).filter((y) => y !== undefined && y !== null))];
    const sortedYears = years.sort((a, b) => b - a);
    
    console.log('✅ [RamaService] Años disponibles (optimizado):', sortedYears);
    return sortedYears;
  } catch (error) {
    console.error('❌ [RamaService] Error obteniendo años:', error);
    return [];
  }
};
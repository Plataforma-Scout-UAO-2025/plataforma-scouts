import { v4 as uuidv4 } from 'uuid';
import { compressImage, cleanupOldImages } from '../utils/image-compression';

export class StorageService {
  private static readonly STORAGE_PREFIX = 'organigrama_images_';
  private static readonly RAMAS_STORAGE_KEY = 'organigrama_ramas';

  static async uploadImage(file: File): Promise<{ objectId: string; url: string }> {
    const objectId = uuidv4();
    
    try {
      console.log(`📸 [StorageService] Comprimiendo imagen: ${file.name} (${file.size} bytes)`);
      
      // Comprimir imagen antes de guardar
      const compressedDataUrl = await compressImage(file, 800, 600, 0.7);
      
      // Intentar limpiar espacio si es necesario
      try {
        localStorage.setItem(`${this.STORAGE_PREFIX}${objectId}`, compressedDataUrl);
      } catch (quotaError) {
        console.warn('⚠️ [StorageService] Espacio insuficiente, limpiando imágenes antiguas...');
        cleanupOldImages();
        
        // Intentar nuevamente después de limpiar
        try {
          localStorage.setItem(`${this.STORAGE_PREFIX}${objectId}`, compressedDataUrl);
        } catch (secondError) {
          throw new Error('Espacio insuficiente en localStorage incluso después de limpiar');
        }
      }
      
      console.log('📸 [StorageService] Imagen comprimida y guardada con ID:', objectId);
      
      return { 
        objectId, 
        url: compressedDataUrl // Devolver la URL directamente para mostrar inmediatamente
      };
    } catch (error) {
      console.error('❌ [StorageService] Error procesando imagen:', error);
      throw error instanceof Error ? error : new Error('Error saving image to localStorage');
    }
  }

  static getImageUrl(objectId: string | null): string | null {
    if (!objectId) {
      console.log('⚠️ [StorageService] ObjectId es null o undefined');
      return null;
    }
    
    const imageData = localStorage.getItem(`${this.STORAGE_PREFIX}${objectId}`);
    if (!imageData) {
      console.warn(`⚠️ [StorageService] No se encontró imagen con ID: ${objectId}`);
      return null;
    }
    
    console.log(`✅ [StorageService] Imagen recuperada con ID: ${objectId}`);
    return imageData;
  }

  static deleteImage(objectId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${objectId}`);
      console.log(`🗑️ [StorageService] Imagen eliminada con ID: ${objectId}`);
    } catch (error) {
      console.error('❌ [StorageService] Error eliminando imagen:', error);
    }
  }

  static async uploadMultipleImages(files: File[]): Promise<Array<{ objectId: string; url: string }>> {
    const uploads = files.map(file => this.uploadImage(file));
    const results = await Promise.all(uploads);
    return results;
  }

  // Método específico para asociar imagen de icono a una rama
  static async uploadRamaIcon(file: File, ramaId: string): Promise<string> {
    try {
      const { objectId, url } = await this.uploadImage(file);
      
      // Actualizar la rama con el nuevo icono
      const ramas = this.getRamasFromStorage();
      const ramaIndex = ramas.findIndex(r => r.id === ramaId || r.section_id === ramaId);
      
      if (ramaIndex !== -1) {
        // Eliminar imagen anterior si existe
        if (ramas[ramaIndex].iconoObjectId) {
          this.deleteImage(ramas[ramaIndex].iconoObjectId);
        }
        
        ramas[ramaIndex].iconoObjectId = objectId;
        ramas[ramaIndex].icono = url; // También guardar la URL para acceso rápido
        this.saveRamasToStorage(ramas);
        
        console.log(`✅ [StorageService] Icono asociado a rama ${ramaId} con objectId: ${objectId}`);
      }
      
      return objectId;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo icono de rama:', error);
      throw error;
    }
  }

  // Método específico para asociar imagen principal a una rama
  static async uploadRamaMainImage(file: File, ramaId: string): Promise<string> {
    try {
      const { objectId, url } = await this.uploadImage(file);
      
      // Actualizar la rama con la nueva imagen principal
      const ramas = this.getRamasFromStorage();
      const ramaIndex = ramas.findIndex(r => r.id === ramaId || r.section_id === ramaId);
      
      if (ramaIndex !== -1) {
        // Eliminar imagen anterior si existe
        if (ramas[ramaIndex].imagenPrincipalObjectId) {
          this.deleteImage(ramas[ramaIndex].imagenPrincipalObjectId);
        }
        
        ramas[ramaIndex].imagenPrincipalObjectId = objectId;
        ramas[ramaIndex].imagenPrincipal = url; // También guardar la URL para acceso rápido
        this.saveRamasToStorage(ramas);
        
        console.log(`✅ [StorageService] Imagen principal asociada a rama ${ramaId} con objectId: ${objectId}`);
      }
      
      return objectId;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo imagen principal de rama:', error);
      throw error;
    }
  }

  // Método para subir múltiples imágenes de galería a una rama
  static async uploadRamaGallery(files: File[], ramaId: string): Promise<string[]> {
    try {
      console.log(`📸 [StorageService] Subiendo ${files.length} imágenes de galería para rama ${ramaId}`);
      
      // Subir todas las imágenes
      const uploadResults = await this.uploadMultipleImages(files);
      const objectIds = uploadResults.map(result => result.objectId);
      
      // Actualizar la rama con las nuevas imágenes de galería
      const ramas = this.getRamasFromStorage();
      const ramaIndex = ramas.findIndex(r => r.id === ramaId || r.section_id === ramaId);
      
      if (ramaIndex !== -1) {
        // Añadir los nuevos objectIds a la galería existente
        if (!ramas[ramaIndex].sectionGalleryObjectIds) {
          ramas[ramaIndex].sectionGalleryObjectIds = [];
        }
        ramas[ramaIndex].sectionGalleryObjectIds.push(...objectIds);
        this.saveRamasToStorage(ramas);
        
        console.log(`✅ [StorageService] ${objectIds.length} imágenes añadidas a galería de rama ${ramaId}`);
      }
      
      return objectIds;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo galería de rama:', error);
      throw error;
    }
  }

  // Método para obtener todas las URLs de la galería de una rama
  static getRamaGalleryUrls(ramaId: string): string[] {
    const ramas = this.getRamasFromStorage();
    const rama = ramas.find(r => r.id === ramaId || r.section_id === ramaId);
    
    if (!rama || !rama.sectionGalleryObjectIds || rama.sectionGalleryObjectIds.length === 0) {
      return [];
    }
    
    const urls: string[] = [];
    for (const objectId of rama.sectionGalleryObjectIds) {
      const url = this.getImageUrl(objectId);
      if (url) {
        urls.push(url);
      }
    }
    
    console.log(`📸 [StorageService] Recuperadas ${urls.length} imágenes de galería para rama ${ramaId}`);
    return urls;
  }

  // Método para obtener la URL del icono de una rama
  static getRamaIconUrl(ramaId: string): string | null {
    const ramas = this.getRamasFromStorage();
    const rama = ramas.find(r => r.id === ramaId || r.section_id === ramaId);
    
    if (!rama) return null;
    
    // Primero intentar con iconoObjectId, luego con icono directo
    if (rama.iconoObjectId) {
      return this.getImageUrl(rama.iconoObjectId);
    } else if (rama.icono && rama.icono.startsWith('data:')) {
      return rama.icono;
    }
    
    return null;
  }

  // Método para obtener la URL de la imagen principal de una rama
  static getRamaMainImageUrl(ramaId: string): string | null {
    const ramas = this.getRamasFromStorage();
    const rama = ramas.find(r => r.id === ramaId || r.section_id === ramaId);
    
    if (!rama) return null;
    
    // Primero intentar con imagenPrincipalObjectId, luego con imagenPrincipal directo
    if (rama.imagenPrincipalObjectId) {
      return this.getImageUrl(rama.imagenPrincipalObjectId);
    } else if (rama.imagenPrincipal && rama.imagenPrincipal.startsWith('data:')) {
      return rama.imagenPrincipal;
    }
    
    return null;
  }

  // Métodos para gestión de Ramas en localStorage
  static getRamasFromStorage(): any[] {
    const stored = localStorage.getItem(this.RAMAS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveRamasToStorage(ramas: any[]): void {
    localStorage.setItem(this.RAMAS_STORAGE_KEY, JSON.stringify(ramas));
  }

  static addRamaToStorage(rama: any): void {
    const existingRamas = this.getRamasFromStorage();
    existingRamas.push(rama);
    this.saveRamasToStorage(existingRamas);
  }

  static updateRamaInStorage(ramaId: string, updatedRama: any): void {
    const existingRamas = this.getRamasFromStorage();
    const index = existingRamas.findIndex(r => r.section_id === ramaId || r.sectionId === ramaId);
    if (index !== -1) {
      existingRamas[index] = updatedRama;
      this.saveRamasToStorage(existingRamas);
    }
  }

  static deleteRamaFromStorage(ramaId: string): void {
    const existingRamas = this.getRamasFromStorage();
    const filtered = existingRamas.filter(r => r.section_id !== ramaId && r.sectionId !== ramaId);
    this.saveRamasToStorage(filtered);
  }

  // ============================================
  // MÉTODOS DE LIMPIEZA Y MANTENIMIENTO
  // ============================================

  /**
   * Limpia todas las imágenes del organigrama para liberar espacio
   */
  static clearAllOrganigramaImages(): void {
    let deletedCount = 0;
    for (let key in localStorage) {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
        deletedCount++;
      }
    }
    console.log(`🧹 [StorageService] ${deletedCount} imágenes del organigrama eliminadas`);
  }

  /**
   * Obtiene estadísticas de uso de localStorage
   */
  static getStorageStats() {
    let totalSize = 0;
    let imageSize = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage.getItem(key)?.length || 0;
        totalSize += size;
        
        if (key.startsWith(this.STORAGE_PREFIX)) {
          imageSize += size;
        }
      }
    }

    return {
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      imageSizeMB: (imageSize / (1024 * 1024)).toFixed(2),
      imageCount: Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX)).length
    };
  }

  // ============================================
  // MÉTODOS ESPECÍFICOS PARA SUBRAMAS
  // ============================================

  // Método específico para asociar imagen de icono a una subrama
  static async uploadSubramaIcon(file: File, subramaId: string): Promise<string> {
    try {
      const { objectId } = await this.uploadImage(file);
      
      console.log(`✅ [StorageService] Icono asociado a subrama ${subramaId} con objectId: ${objectId}`);
      return objectId;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo icono de subrama:', error);
      throw error;
    }
  }

  // Método específico para asociar imagen principal a una subrama
  static async uploadSubramaMainImage(file: File, subramaId: string): Promise<string> {
    try {
      const { objectId } = await this.uploadImage(file);
      
      console.log(`✅ [StorageService] Imagen principal asociada a subrama ${subramaId} con objectId: ${objectId}`);
      return objectId;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo imagen principal de subrama:', error);
      throw error;
    }
  }

  // Método para subir múltiples imágenes de galería a una subrama
  static async uploadSubramaGallery(files: File[], subramaId: string): Promise<string[]> {
    try {
      console.log(`📸 [StorageService] Subiendo ${files.length} imágenes de galería para subrama ${subramaId}`);
      
      // Subir todas las imágenes
      const uploadResults = await this.uploadMultipleImages(files);
      const objectIds = uploadResults.map(result => result.objectId);
      
      console.log(`✅ [StorageService] ${objectIds.length} imágenes añadidas a galería de subrama ${subramaId}`);
      return objectIds;
    } catch (error) {
      console.error('❌ [StorageService] Error subiendo galería de subrama:', error);
      throw error;
    }
  }

  // Método para obtener todas las URLs de la galería de una subrama
  static getSubramaGalleryUrls(subramaId: string): string[] {
    // Buscar la subrama en localStorage independiente
    const subramas = this.getSubramasFromStorage();
    const subrama = subramas.find(s => s.id === subramaId || s.subgroup_id === subramaId);
    
    if (subrama && subrama.subgroupGalleryObjectIds && subrama.subgroupGalleryObjectIds.length > 0) {
      const urls: string[] = [];
      for (const objectId of subrama.subgroupGalleryObjectIds) {
        const url = this.getImageUrl(objectId);
        if (url) {
          urls.push(url);
        }
      }
      
      console.log(`📸 [StorageService] Recuperadas ${urls.length} imágenes de galería para subrama ${subramaId}`);
      return urls;
    }
    
    return [];
  }

  // Métodos para gestión de Subramas en localStorage
  private static readonly SUBRAMAS_STORAGE_KEY = 'organigrama_subramas';

  static getSubramasFromStorage(): any[] {
    const stored = localStorage.getItem(this.SUBRAMAS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveSubramasToStorage(subramas: any[]): void {
    localStorage.setItem(this.SUBRAMAS_STORAGE_KEY, JSON.stringify(subramas));
  }
}
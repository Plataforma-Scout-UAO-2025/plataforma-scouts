import { StorageService } from '../services/storage.service';

/**
 * Funciones de utilidad para debugging y limpieza del almacenamiento
 */

/**
 * Muestra estadísticas de uso de localStorage
 */
export const logStorageStats = (): void => {
  const stats = StorageService.getStorageStats();
  
  console.group('📊 Estadísticas de Almacenamiento');
  console.log(`📦 Uso total: ${stats.totalSizeMB}MB`);
  console.log(`🖼️ Imágenes: ${stats.imageSizeMB}MB`);
  console.log(`📷 Cantidad de imágenes: ${stats.imageCount}`);
  console.groupEnd();
  
  if (parseFloat(stats.totalSizeMB) > 4) {
    console.warn('⚠️ Advertencia: El uso de localStorage está cerca del límite (>4MB)');
    console.log('💡 Usa cleanupStorage() para limpiar imágenes');
  }
};

/**
 * Limpia todas las imágenes del organigrama
 */
export const cleanupStorage = (): void => {
  const beforeStats = StorageService.getStorageStats();
  console.log(`📊 Antes de limpiar: ${beforeStats.totalSizeMB}MB`);
  
  StorageService.clearAllOrganigramaImages();
  
  const afterStats = StorageService.getStorageStats();
  console.log(`📊 Después de limpiar: ${afterStats.totalSizeMB}MB`);
  console.log(`✅ Liberado: ${(parseFloat(beforeStats.totalSizeMB) - parseFloat(afterStats.totalSizeMB)).toFixed(2)}MB`);
};

// Hacer las funciones disponibles globalmente
if (typeof window !== 'undefined') {
  (window as Window & { organigramaDebug?: Record<string, unknown> }).organigramaDebug = {
    logStorageStats,
    cleanupStorage,
    getStats: () => StorageService.getStorageStats()
  };
  
  console.log('🔧 Funciones de debug disponibles: window.organigramaDebug');
  console.log('📊 Para ver estadísticas: organigramaDebug.logStorageStats()');
  console.log('🧹 Para limpiar: organigramaDebug.cleanupStorage()');
}
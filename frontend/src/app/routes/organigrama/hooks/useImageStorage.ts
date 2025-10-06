import { useCallback } from 'react';
<<<<<<< HEAD
import { StorageService } from '../services/storage.service';

export const useImageStorage = () => {
  const getImageUrl = useCallback((objectId: string | null): string | null => {
    return StorageService.getImageUrl(objectId);
=======

// Hook refactorizado para manejar imágenes desde backend real
export const useImageStorage = () => {
  const getImageUrl = useCallback((objectId: string | null): string | null => {
    // Ahora las URLs vienen directamente del backend, no necesitamos localStorage
    // Si objectId es una URL completa, la devolvemos tal como está
    if (objectId && (objectId.startsWith('http') || objectId.startsWith('data:'))) {
      return objectId;
    }
    
    // Si no es una URL válida, devolvemos null
    console.warn('⚠️ [useImageStorage] ObjectId no es una URL válida:', objectId);
    return null;
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  }, []);

  const getGalleryUrls = useCallback((objectIds: string[]): string[] => {
    return objectIds
<<<<<<< HEAD
      .map(id => StorageService.getImageUrl(id))
=======
      .map(id => {
        // Las URLs ahora vienen directamente del backend
        if (id && (id.startsWith('http') || id.startsWith('data:'))) {
          return id;
        }
        return null;
      })
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
      .filter((url): url is string => url !== null);
  }, []);

  return {
    getImageUrl,
    getGalleryUrls
  };
};
import { useCallback } from 'react';
import { StorageService } from '../services/storage.service';

export const useImageStorage = () => {
  const getImageUrl = useCallback((objectId: string | null): string | null => {
    return StorageService.getImageUrl(objectId);
  }, []);

  const getGalleryUrls = useCallback((objectIds: string[]): string[] => {
    return objectIds
      .map(id => StorageService.getImageUrl(id))
      .filter((url): url is string => url !== null);
  }, []);

  return {
    getImageUrl,
    getGalleryUrls
  };
};
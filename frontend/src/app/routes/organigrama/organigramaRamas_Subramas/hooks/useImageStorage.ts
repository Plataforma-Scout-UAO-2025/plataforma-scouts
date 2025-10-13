import { useCallback } from 'react';

export const useImageStorage = () => {
  const getImageUrl = useCallback((objectId: string | null): string | null => {
    if (objectId && (objectId.startsWith('http') || objectId.startsWith('data:'))) {
      return objectId;
    }
    console.debug('[useImageStorage] ObjectId no es una URL válida:', objectId);
    return null;
  }, []);

  const getGalleryUrls = useCallback((objectIds: string[]): string[] => {
    return objectIds
      .map(id => (id && (id.startsWith('http') || id.startsWith('data:'))) ? id : null)
      .filter((url): url is string => url !== null);
  }, []);

  return {
    getImageUrl,
    getGalleryUrls
  };
};
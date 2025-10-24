import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import {
  setRamasCache,
  invalidateRamasCache,
  clearAllCache,
  clearExpiredCache,
  selectCacheStats,
} from '@/store/organigrama/organigramaCache.slice';
import type { Branch as Rama } from '@/app/routes/organigrama/organigramaRamas_Subramas/types/frontend';

interface UseOrganigramaCacheReturn {
  // Guardar en cache
  setCachedRamas: (tenantId: string, groupSlug: string, ramas: Rama[]) => void;
  
  // Invalidar cache
  invalidateCache: (tenantId: string, groupSlug: string) => void;
  clearCache: () => void;
  cleanExpiredCache: () => void;
  
  // Estadísticas
  cacheStats: {
    totalEntries: number;
    expiredEntries: number;
  };
}

export const useOrganigramaCache = (): UseOrganigramaCacheReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selector para estadísticas del cache
  const cacheStats = useSelector((state: RootState) => selectCacheStats(state));

  // Guardar en cache
  const setCachedRamas = useCallback((tenantId: string, groupSlug: string, ramas: Rama[]) => {
    dispatch(setRamasCache({ tenantId, groupSlug, ramas }));
  }, [dispatch]);

  // Invalidar cache específico
  const invalidateCache = useCallback((tenantId: string, groupSlug: string) => {
    dispatch(invalidateRamasCache({ tenantId, groupSlug }));
  }, [dispatch]);

  // Limpiar todo el cache
  const clearCache = useCallback(() => {
    dispatch(clearAllCache());
  }, [dispatch]);

  // Limpiar cache expirado
  const cleanExpiredCache = useCallback(() => {
    dispatch(clearExpiredCache());
  }, [dispatch]);

  return {
    setCachedRamas,
    invalidateCache,
    clearCache,
    cleanExpiredCache,
    cacheStats,
  };
};
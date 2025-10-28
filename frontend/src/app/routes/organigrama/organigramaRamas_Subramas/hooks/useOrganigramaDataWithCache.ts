import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import type { RootState } from '@/store/store';
import { selectRamasCache } from '@/store/organigrama/organigramaCache.slice';
import { useOrganigramaCache } from '@/hooks/useOrganigramaCache';
import type { Branch as Rama } from '../types/frontend';
import * as organigramaService from '../services';
import { useApiError } from './useApiError';

/**
 * Hook mejorado que usa Redux para el cache de ramas del organigrama.
 * Mantiene compatibilidad con el hook original pero con cache persistente.
 */
export function useOrganigramaDataWithCache(tenantId?: string, groupSlug?: string) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLoadingRamasRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const { handleError } = useApiError();
  const { setCachedRamas, invalidateCache, cleanExpiredCache } = useOrganigramaCache();
  const store = useStore<RootState>();

  // Selector para obtener datos del cache
  const cachedData = useSelector((state: RootState) => {
    if (!tenantId || !groupSlug) return null;
    return selectRamasCache(tenantId, groupSlug)(state);
  });

  // Función para obtener cache actual
  const getCurrentCacheData = useCallback(() => {
    if (!tenantId || !groupSlug) return null;
    const state = store.getState();
    return selectRamasCache(tenantId, groupSlug)(state);
  }, [tenantId, groupSlug, store]);

  // Función para filtrar niveles organizativos
  const filterOrganizationalLevels = useCallback((ramas: Rama[]): Rama[] => {
    const normalize = (s: string) => String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    return ramas.filter((rama) => {
      const n = normalize(String(rama.name || rama.nombre || ''));
      return !(
        n.includes('comit') ||
        n.includes('asamblea') ||
        n.includes('corte') ||
        n.includes('consejo')
      );
    });
  }, []);

  // Función para ordenar ramas según el orden scout
  const sortRamas = useCallback((ramas: Rama[]): Rama[] => {
    const ordenRamas = ['cachorros', 'manada', 'webelos', 'tropa', 'clan'];
    
    return ramas.sort((a, b) => {
      const nameA = String(a.name || a.nombre || '').toLowerCase();
      const nameB = String(b.name || b.nombre || '').toLowerCase();
      
      const indexA = ordenRamas.findIndex(orden => nameA.includes(orden));
      const indexB = ordenRamas.findIndex(orden => nameB.includes(orden));
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return nameA.localeCompare(nameB);
    });
  }, []);

  const loadRamas = useCallback(
    async (opts?: { force?: boolean }) => {
      if (isLoadingRamasRef.current) return;

      if (!tenantId || !groupSlug) {
        controllerRef.current?.abort();
        setIsFetching(false);
        setIsLoaded(false);
        setRamas([]);
        return;
      }

      // Si es forzado, invalidar cache primero
      if (opts?.force) {
        console.log('🔄 Force refresh: Invalidating cache');
        invalidateCache(tenantId, groupSlug);
      }

      // Obtener estado actual del cache
      const currentCacheData = getCurrentCacheData();

      // Verificar cache de Redux (después de posible invalidación)
      if (!opts?.force && currentCacheData?.isValid) {
        console.log('🎯 Cache HIT: Serving ramas from Redux cache');
        setRamas(currentCacheData.data);
        setIsLoaded(true);
        setIsFetching(false);
        return;
      }

      // Si el cache expiró, invalidarlo
      if (currentCacheData?.isExpired) {
        invalidateCache(tenantId, groupSlug);
      }

      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      try {
        isLoadingRamasRef.current = true;
        setIsFetching(true);

        console.log('🔄 Cache MISS: Fetching ramas from API');

        let attempt = 0;
        let lastError: unknown = null;
        
        while (attempt < 2) {
          try {
            const data = await organigramaService.getRamasWithSubramas(
              tenantId,
              groupSlug,
              { signal: ctrl.signal }
            );
            
            // Procesar datos
            let processedRamas = filterOrganizationalLevels(data);
            processedRamas = sortRamas(processedRamas);
            
            // Guardar en cache de Redux
            setCachedRamas(tenantId, groupSlug, processedRamas);
            
            setRamas(processedRamas);
            setIsLoaded(true);
            setIsFetching(false);
            
            // Limpiar cache expirado en background
            cleanExpiredCache();
            
            return;
          } catch (err: unknown) {
            const castErr = err as { name?: string } | undefined;
            if (castErr?.name === 'AbortError') throw err;
            lastError = err;
            attempt += 1;
            if (attempt < 2) {
              await new Promise((res) => setTimeout(res, 200));
            }
          }
        }
        handleError(lastError);
      } catch (err) {
        const castErr = err as { name?: string } | undefined;
        if (castErr?.name !== 'AbortError') {
          handleError(err);
        }
      } finally {
        setIsFetching(false);
        isLoadingRamasRef.current = false;
      }
    },
    [
      tenantId, 
      groupSlug, 
      getCurrentCacheData,
      handleError, 
      setCachedRamas, 
      invalidateCache, 
      cleanExpiredCache,
      filterOrganizationalLevels,
      sortRamas
    ]
  );



  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!tenantId || !groupSlug) {
      controllerRef.current?.abort();
      setIsFetching(false);
      setIsLoaded(false);
      setRamas([]);
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      loadRamas();
      debounceTimerRef.current = null;
    }, 100);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      controllerRef.current?.abort();
    };
  }, [tenantId, groupSlug, loadRamas]);

  return {
    ramas,
    isLoading: isFetching,
    isFetching,
    isLoaded,
    loadRamas,
    // Información adicional del cache
    isCached: cachedData?.isValid ?? false,
    cacheExpired: cachedData?.isExpired ?? false,
  };
}

export default useOrganigramaDataWithCache;
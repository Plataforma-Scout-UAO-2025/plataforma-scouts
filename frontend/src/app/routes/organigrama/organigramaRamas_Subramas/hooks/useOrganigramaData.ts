import { useCallback, useEffect, useRef, useState } from 'react';
import type { Branch as Rama } from '../types/frontend';
import * as organigramaService from '../services';
import { useApiError } from '../hooks/useApiError';


const CACHE_TTL_MS = 30_000; // 30s
type CacheEntry = { ts: number; data: Rama[] };
const ramasCache = new Map<string, CacheEntry>();

export function useOrganigramaData(tenantId?: string, groupSlug?: string) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLoadingRamasRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const { handleError } = useApiError();

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

      const cacheKey = `${tenantId}::${groupSlug}`;
      const cached = ramasCache.get(cacheKey);
      const now = Date.now();
      if (!opts?.force && cached && now - cached.ts < CACHE_TTL_MS) {
        setRamas(cached.data);
        setIsLoaded(true);
        setIsFetching(false);
        return;
      }

      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      try {
        isLoadingRamasRef.current = true;
        setIsFetching(true);

  let attempt = 0;
  let lastError: unknown = null;
        while (attempt < 2) {
          try {
            const data = await organigramaService.getRamasWithSubramas(
              tenantId,
              groupSlug,
              { signal: ctrl.signal }
            );
            
            // Filtrar niveles organizativos: excluir nombres que contengan 'comit', 'asamblea', 'corte', 'consejo' (sin acentos)
            const normalize = (s: string) => String(s || '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();
            const ramasSinOrganizativos = data.filter((rama) => {
              const n = normalize(String(rama.name || (rama as any).nombre || ''));
              return !(
                n.includes('comit') ||
                n.includes('asamblea') ||
                n.includes('corte') ||
                n.includes('consejo')
              );
            });
            
            // Ordenar ramas según el orden específico de secciones scout
            const ordenRamas = ['cachorros', 'manada', 'webelos', 'tropa', 'clan'];
            const ramasOrdenadas = ramasSinOrganizativos.sort((a, b) => {
              const nameA = String(a.name || a.nombre || '').toLowerCase();
              const nameB = String(b.name || b.nombre || '').toLowerCase();
              
              // Buscar el índice de cada rama en el orden definido
              const indexA = ordenRamas.findIndex(orden => nameA.includes(orden));
              const indexB = ordenRamas.findIndex(orden => nameB.includes(orden));
              
              // Si ambas ramas están en el orden definido, ordenar por índice
              if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
              }
              
              // Si solo una está en el orden, la que está va primero
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              
              // Si ninguna está en el orden, ordenar alfabéticamente
              return nameA.localeCompare(nameB);
            });
            
            ramasCache.set(cacheKey, { ts: Date.now(), data: ramasOrdenadas });
            setRamas(ramasOrdenadas);
            setIsLoaded(true);
            setIsFetching(false);
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
    [tenantId, groupSlug, handleError]
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
  };
}

export default useOrganigramaData;
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Branch as Rama } from '../types/frontend';
import * as organigramaService from '../services';
import { useApiError } from '../hooks/useApiError';

// Lightweight in-memory cache to avoid duplicate network calls while the
// component is mounted. Keys are `${tenantId}::${groupSlug}`. TTL is short
// because organigrama can change in the UI and we want fresh data on explicit
// reloads.
const CACHE_TTL_MS = 30_000; // 30s
type CacheEntry = { ts: number; data: Rama[] };
const ramasCache = new Map<string, CacheEntry>();

export function useOrganigramaData(tenantId?: string, groupSlug?: string) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  // explicit flags: isFetching = network in progress, isLoaded = we have data
  const [isFetching, setIsFetching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLoadingRamasRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const { handleError } = useApiError();

  const loadRamas = useCallback(
    async (opts?: { force?: boolean }) => {
      // avoid duplicate calls
      if (isLoadingRamasRef.current) return;

      if (!tenantId || !groupSlug) {
        // clear state when params missing
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

      // abort previous inflight request for freshness
      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      try {
        isLoadingRamasRef.current = true;
        setIsFetching(true);

        // lightweight retry: 1 attempt + 1 retry with short backoff
        let attempt = 0;
        let lastError: any = null;
        while (attempt < 2) {
          try {
            const data = await organigramaService.getRamasWithSubramas(
              tenantId,
              groupSlug,
              { signal: ctrl.signal }
            );
            // save cache
            ramasCache.set(cacheKey, { ts: Date.now(), data });
            setRamas(data);
            setIsLoaded(true);
            setIsFetching(false);
            return;
          } catch (err: any) {
            if (err?.name === 'AbortError') throw err;
            lastError = err;
            attempt += 1;
            if (attempt < 2) {
              // small backoff
              await new Promise((res) => setTimeout(res, 200));
            }
          }
        }
        // if we reach here both attempts failed
        handleError(lastError);
      } catch (err) {
        // propagate aborts silently (component unmount or new params)
        if ((err as any)?.name !== 'AbortError') {
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
    // debounce param changes to avoid a flurry of requests when the app is
    // resolving tenant/group or when token refreshes happen quickly.
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!tenantId || !groupSlug) {
      // clear state immediately when params become invalid
      controllerRef.current?.abort();
      setIsFetching(false);
      setIsLoaded(false);
      setRamas([]);
      return;
    }

    // schedule the actual load with a short debounce
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    debounceTimerRef.current = window.setTimeout(() => {
      loadRamas();
      debounceTimerRef.current = null;
    }, 100);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // abort running request on param change/unmount
      controllerRef.current?.abort();
    };
  }, [tenantId, groupSlug, loadRamas]);

  return {
    ramas,
    // keep a backwards-compatible isLoading flag for callers that expect it
    isLoading: isFetching,
    isFetching,
    isLoaded,
    loadRamas,
  };
}

export default useOrganigramaData;

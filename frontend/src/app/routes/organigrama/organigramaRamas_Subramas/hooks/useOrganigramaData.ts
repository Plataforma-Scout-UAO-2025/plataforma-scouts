import { useCallback, useEffect, useRef, useState } from 'react';
import type { Branch as Rama } from '../types/frontend';
import * as organigramaService from '../services';
import { useApiError } from '../hooks/useApiError';

export function useOrganigramaData(tenantId?: string, groupSlug?: string) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isLoadingRamasRef = useRef(false);

  const { handleError } = useApiError();

  const loadRamas = useCallback(async () => {
    console.log('[useOrganigramaData] loadRamas invoked', { tenantId, groupSlug });
    if (isLoadingRamasRef.current) return;
    if (!tenantId || !groupSlug) {
      setIsLoading(false);
      setRamas([]);
      console.log('[useOrganigramaData] skipping loadRamas - missing tenant/group');
      return;
    }
    try {
      isLoadingRamasRef.current = true;
      setIsLoading(true);

      const data = await organigramaService.getRamasWithSubramas(tenantId, groupSlug);
      setRamas(data);
      console.log('[useOrganigramaData] ramas loaded', { count: data.length });
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      isLoadingRamasRef.current = false;
    }
  }, [tenantId, groupSlug, handleError]);

  useEffect(() => {
    if (tenantId && groupSlug) {
      loadRamas();
    } else {
      setIsLoading(false);
      setRamas([]);
    }
  }, [tenantId, groupSlug, loadRamas]);

  return {
    ramas,
    isLoading,
    loadRamas,
  };
}

export default useOrganigramaData;

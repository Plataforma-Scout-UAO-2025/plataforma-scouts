import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { extractTenantIdFromClaims } from '../utils/tenantUtils';
import { logger } from '../utils/logger';
import { fetchDefaultGroupForTenant } from '../utils/fetchGroup';
import { resolveTenantFromToken } from '../utils/resolveTenantFromToken';
import type { TenantParams } from '../types/tenant';

export const useTenantParams = (): TenantParams => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  const [groupSlug, setGroupSlug] = useState<string | undefined>(undefined);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    logger.debug('state', {
      tenantId,
      groupSlug,
      tenantLoading,
      groupLoading,
      error,
      hasAuthUser: Boolean(user),
      isAuthenticated,
    });
  }, [tenantId, groupSlug, tenantLoading, groupLoading, error, user, isAuthenticated]);

  useEffect(() => {
    const claims = user as Record<string, unknown> | undefined;
    const extracted = extractTenantIdFromClaims(claims);
    if (extracted && extracted !== tenantId) {
      setTenantId(extracted);
      setError(undefined);
    }

    setTenantLoading(false);
  }, [user, tenantId]);
  

  useEffect(() => {
    if (tenantId || !isAuthenticated || !getAccessTokenSilently) return;

    let isMounted = true;
    const run = async () => {
      try {
  setTenantLoading(true);
        const extracted = await resolveTenantFromToken(getAccessTokenSilently as unknown as () => Promise<string>);
        if (isMounted && extracted && extracted !== tenantId) {
          setTenantId(extracted);
          setError(undefined);
          setTenantLoading(false);
        }
      } catch (err) {
        console.error('[useTenantParams] Error obteniendo tenantId desde el token', err);
        if (isMounted) setError('No se pudo determinar el tenant desde el token.');
      } finally {
        if (isMounted) setTenantLoading(false);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [tenantId, isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (!tenantId || groupSlug) return;

    let isMounted = true;
    const controller = new AbortController();
    const run = async () => {
      try {
  setGroupLoading(true);
  logger.debug('fetching default group for tenant', tenantId);
        const slug = await fetchDefaultGroupForTenant(tenantId, controller.signal);
        if (!isMounted) return;
        if (slug) {
          setGroupSlug(slug);
          setError(undefined);
        } else {
          setError('No se encontró ningún grupo asociado al tenant.');
        }
      } catch (err) {
        const e = err as { name?: string } | undefined;
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') {
          logger.debug('fetch aborted for tenant', tenantId);
        } else {
          logger.error('Error obteniendo grupos para el tenant', err);
          if (isMounted) setError('No se pudo obtener el grupo por defecto del tenant.');
        }
      } finally {
        if (isMounted) setGroupLoading(false);
      }
    };

    void run();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tenantId, groupSlug]);

  const isFetching = tenantLoading || groupLoading;
  const hasMissingParams = !tenantId || !groupSlug;
  const isLoading = isFetching;

  return useMemo(() => ({
    tenantId,
    groupSlug,
    isLoading,
    isFetching,
    hasMissingParams,
    error,
  }), [tenantId, groupSlug, isLoading, isFetching, hasMissingParams, error]);
};
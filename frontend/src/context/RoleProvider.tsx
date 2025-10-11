import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '@/api/axios';
import { buildRoleInfo, RawRole, getRoleLabel } from '@/roles/roles';
import { RoleContext } from './role-context';
import type { RoleStatus, RoleContextValue } from './role-context';
import { DEV_CONFIG } from '@/config/dev.config';

interface FetchResult {
  roles: string[];
  selected: string | null;
}

const MAX_ATTEMPTS = 4; // 1 inicial + 3 reintentos

async function fetchRolesWithRetry(): Promise<FetchResult> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await api.get<string[]>('/sec/roles');
      const list = Array.isArray(res.data) ? res.data : [];
      const selected = list[0] || RawRole.GUEST;
      return { roles: list, selected };
    } catch (e) {
      lastError = e;
      if (attempt < MAX_ATTEMPTS - 1) {
        const delay = 300 * (attempt + 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth0();
  const [status, setStatus] = useState<RoleStatus>('idle');
  const [roles, setRoles] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const fetchingRef = useRef(false);
  const lastAttemptRef = useRef<number>(0);

  // ⚠️ MODO DEV: Configurar role directamente sin API
  useEffect(() => {
    if (DEV_CONFIG.skipAuth) {
      setRoles([DEV_CONFIG.mockRole]);
      setCurrentUserRole(DEV_CONFIG.mockRole);
      setStatus('success');
      return;
    }
  }, []);

  const loadRoles = useCallback(async () => {
    if (!isAuthenticated) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setStatus('loading');
    setError(undefined);
    try {
      const result = await fetchRolesWithRetry();
      setRoles(result.roles);
      setCurrentUserRole(result.selected ?? RawRole.GUEST);
      setStatus('success');
    } catch {
      console.error('Servicio interrumpido por falta de conexión');
      setRoles([]);
      setCurrentUserRole(RawRole.GUEST);
      setError('Estamos teniendo problemas de conexión. Por favor intenta más tarde.');
      setStatus('error');
    } finally {
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (DEV_CONFIG.skipAuth) return; // Skip en modo DEV
    if (isAuthenticated && status === 'idle') {
      loadRoles();
    }
  }, [isAuthenticated, status, loadRoles]);

  const retry = useCallback(() => {
    if (status === 'loading') return;
    lastAttemptRef.current = Date.now();
    loadRoles();
  }, [status, loadRoles]);

  const normalized = buildRoleInfo(currentUserRole);

  const value: RoleContextValue = {
    status,
    roles,
    currentUserRole: normalized.role,
    currentUserRoleLabel: getRoleLabel(normalized.role),
    error,
    retry,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

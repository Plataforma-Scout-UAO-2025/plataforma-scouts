import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '@/api/axios';
import { buildRoleInfo, RawRole, getRoleLabel } from '@/roles/roles';

// Estado interno del contexto
type RoleStatus = 'idle' | 'loading' | 'success' | 'error';

interface RoleContextValue {
  status: RoleStatus;
  roles: string[]; // Crudo del backend
  currentUserRole: string | null; // Crudo seleccionado (índice 0 o 'GUEST')
  currentUserRoleLabel: string; // Etiqueta amigable
  error?: string;
  retry: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

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
      // backoff simple (300ms * attemptIndex)
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

  const loadRoles = useCallback(async () => {
    if (!isAuthenticated) return; // No hace nada si no está autenticado
    if (fetchingRef.current) return; // Evita concurrencia
    fetchingRef.current = true;
    setStatus('loading');
    setError(undefined);
    try {
      const result = await fetchRolesWithRetry();
      setRoles(result.roles);
      setCurrentUserRole(result.selected ?? RawRole.GUEST);
      setStatus('success');
    } catch (e) {
      console.error('Error al obtener roles:', e);
      setRoles([]);
      setCurrentUserRole(RawRole.GUEST);
      setError('No se pudo obtener tu rol. Intenta recargar.');
      setStatus('error');
    } finally {
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // Efecto inicial cuando el usuario se autentica
  useEffect(() => {
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

export function useRoleContext(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoleContext debe usarse dentro de RoleProvider');
  return ctx;
}

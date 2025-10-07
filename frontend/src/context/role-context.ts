import { createContext } from 'react';

// Estado interno del contexto
export type RoleStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RoleContextValue {
  status: RoleStatus;
  roles: string[];
  currentUserRole: string | null;
  currentUserRoleLabel: string;
  error?: string;
  retry: () => void;
}

export const RoleContext = createContext<RoleContextValue | undefined>(undefined);

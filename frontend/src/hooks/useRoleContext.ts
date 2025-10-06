import { useContext } from 'react';
import { RoleContext } from '@/context/role-context';

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoleContext debe usarse dentro de RoleProvider');
  return ctx;
}

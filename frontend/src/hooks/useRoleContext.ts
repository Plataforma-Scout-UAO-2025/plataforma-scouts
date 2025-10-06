import { useContext } from 'react';
import { RoleContext } from '@/context/RoleContext';

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoleContext debe usarse dentro de RoleProvider');
  return ctx;
}

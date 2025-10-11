import { useRoleContext } from './useRoleContext';
import { RawRole } from '@/roles/roles';

export function useRoleCheck() {
  const { currentUserRole } = useRoleContext();

  return {
    currentRole: currentUserRole,
    
    // Administradores
    isAdminGlobal: currentUserRole === RawRole.ADMIN_GLOBAL,
    isAdminGrupo: currentUserRole === RawRole.ADMIN_GRUPO,
    isComiteAdmin: currentUserRole === RawRole.COMITE_ADMIN,
    
    // Roles específicos
    isAcudiente: currentUserRole === RawRole.ACUDIENTE,
    isScout: currentUserRole === RawRole.SCOUT,
    isScouter: currentUserRole === RawRole.SCOUTER,
    isTesorero: currentUserRole === RawRole.TESORERO,
    
    // Otros
    isDevSupport: currentUserRole === RawRole.DEV_SUPPORT,
    isGuest: currentUserRole === RawRole.GUEST,
    isUnknown: currentUserRole === RawRole.UNKNOWN,
    
    // Helpers combinados
    isAnyAdmin: 
      currentUserRole === RawRole.ADMIN_GLOBAL ||
      currentUserRole === RawRole.ADMIN_GRUPO ||
      currentUserRole === RawRole.COMITE_ADMIN,
    
    isAuthenticatedUser:
      currentUserRole !== RawRole.GUEST &&
      currentUserRole !== RawRole.UNKNOWN,
  };
}

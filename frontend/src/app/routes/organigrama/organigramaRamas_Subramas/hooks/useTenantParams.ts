import { useMemo } from 'react';

interface TenantParams {
  tenantSlug: string;
  groupSlug: string;
}

// Hook para obtener tenantSlug y groupSlug
export const useTenantParams = (): TenantParams => {
  return useMemo(() => {
    const tenantFromEnv = import.meta.env.VITE_TENANT_SLUG;
    const groupFromEnv = import.meta.env.VITE_GROUP_SLUG;
    
    if (tenantFromEnv && groupFromEnv) {
      return {
        tenantSlug: tenantFromEnv,
        groupSlug: groupFromEnv
      };
    }

    // Valores hardcodeados como fallback
    return {
      tenantSlug: 'staging-centinelas-113',
      groupSlug: 'grupo-scout-centinelas-113'     
    };
  }, []);
};

// Función helper para construir rutas de la API
export const buildApiPath = (
  tenantSlug: string, 
  groupSlug: string, 
  resource: string,
  ...additionalPaths: string[]
): string => {
  const basePath = `tenants/${tenantSlug}/groups/${groupSlug}`;
  const fullPath = [basePath, resource, ...additionalPaths].filter(Boolean).join('/');
  return fullPath;
};
import { useMemo } from 'react';

interface TenantParams {
  tenantSlug: string;
  groupSlug: string;
}

// Hook para obtener tenantSlug y groupSlug
export const useTenantParams = (): TenantParams => {
  return useMemo(() => {
    // Intentar obtener de variables de entorno primero
    const tenantFromEnv = import.meta.env.VITE_TENANT_SLUG;
    const groupFromEnv = import.meta.env.VITE_GROUP_SLUG;
    
    // Si existen en el environment, usar esos valores
    if (tenantFromEnv && groupFromEnv) {
      return {
        tenantSlug: tenantFromEnv,
        groupSlug: groupFromEnv
      };
    }
    
    // Valores por defecto más comunes - CAMBIAR ESTOS POR VALORES REALES
    return {
      tenantSlug: 'scouts-main',
      groupSlug: 'group-1'     
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
  const basePath = `/api/tenants/${tenantSlug}/groups/${groupSlug}`;
  const fullPath = [basePath, resource, ...additionalPaths].filter(Boolean).join('/');
  return fullPath;
};
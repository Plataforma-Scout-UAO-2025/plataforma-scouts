/**
 * Hook avanzado para gestión dinámica de tenant y group
 * Soporta configuración por .env, URL params, y override manual
 */

import { useState, useEffect, useMemo } from 'react';

interface TenantConfig {
  tenantSlug: string;
  groupSlug: string;
  isConfigured: boolean;
  configError?: string;
  source: 'env' | 'url' | 'override' | 'default';
}

interface TenantConfigOptions {
  allowUrlOverride?: boolean;
  allowManualOverride?: boolean;
  defaultTenant?: string;
  defaultGroup?: string;
}

export const useTenantConfig = (options: TenantConfigOptions = {}): TenantConfig & {
  setTenantSlug: (slug: string) => void;
  setGroupSlug: (slug: string) => void;
  resetToEnv: () => void;
} => {
  const [manualTenant, setManualTenant] = useState<string>('');
  const [manualGroup, setManualGroup] = useState<string>('');

  // Obtener configuración desde diferentes fuentes
  const config = useMemo(() => {
    // 1. Prioridad más alta: Override manual
    if (manualTenant && manualGroup && options.allowManualOverride) {
      return {
        tenantSlug: manualTenant,
        groupSlug: manualGroup,
        isConfigured: true,
        source: 'override' as const
      };
    }

    // 2. URL parameters (si está permitido)
    if (options.allowUrlOverride && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenant = urlParams.get('tenant');
      const urlGroup = urlParams.get('group');
      
      if (urlTenant && urlGroup) {
        return {
          tenantSlug: urlTenant,
          groupSlug: urlGroup,
          isConfigured: true,
          source: 'url' as const
        };
      }
    }

    // 3. Variables de entorno
    const envTenant = import.meta.env.VITE_TENANT_SLUG;
    const envGroup = import.meta.env.VITE_GROUP_SLUG;

    if (envTenant && envGroup && 
        envTenant !== 'tu-tenant-aqui' && 
        envGroup !== 'tu-grupo-aqui') {
      return {
        tenantSlug: envTenant,
        groupSlug: envGroup,
        isConfigured: true,
        source: 'env' as const
      };
    }

    // 4. Valores por defecto
    if (options.defaultTenant && options.defaultGroup) {
      return {
        tenantSlug: options.defaultTenant,
        groupSlug: options.defaultGroup,
        isConfigured: true,
        source: 'default' as const
      };
    }

    // 5. Sin configuración válida
    return {
      tenantSlug: '',
      groupSlug: '',
      isConfigured: false,
      configError: 'Tenant y Group no están configurados. Revisa tu archivo .env',
      source: 'env' as const
    };
  }, [manualTenant, manualGroup, options]);

  const setTenantSlug = (slug: string) => {
    if (options.allowManualOverride) {
      setManualTenant(slug);
    }
  };

  const setGroupSlug = (slug: string) => {
    if (options.allowManualOverride) {
      setManualGroup(slug);
    }
  };

  const resetToEnv = () => {
    setManualTenant('');
    setManualGroup('');
  };

  return {
    ...config,
    setTenantSlug,
    setGroupSlug,
    resetToEnv
  };
};

/**
 * Función helper para construir URLs dinámicas según la guía de endpoints
 */
export const buildOrganigramaUrl = (
  endpoint: string, 
  tenantSlug?: string, 
  groupSlug?: string
): string => {
  // Si no se proporcionan parámetros, usar configuración actual
  if (!tenantSlug || !groupSlug) {
    const envTenant = import.meta.env.VITE_TENANT_SLUG;
    const envGroup = import.meta.env.VITE_GROUP_SLUG;
    
    if (!envTenant || envTenant === 'tu-tenant-aqui') {
      throw new Error('VITE_TENANT_SLUG no está configurado correctamente');
    }
    
    if (!envGroup || envGroup === 'tu-grupo-aqui') {
      throw new Error('VITE_GROUP_SLUG no está configurado correctamente');
    }
    
    tenantSlug = envTenant;
    groupSlug = envGroup;
  }

  // Limpiar endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Construir URL según la guía de endpoints
  return `/tenants/${tenantSlug}/groups/${groupSlug}/${cleanEndpoint}`;
};

/**
 * Hook para obtener lista de tenants disponibles (para selección dinámica)
 */
export const useAvailableTenants = () => {
  const [tenants, setTenants] = useState<Array<{slug: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);

  const fetchTenants = async () => {
    // Esta función se puede implementar para obtener tenants desde el backend
    // GET /tenants según la guía de endpoints
    setLoading(true);
    try {
      // Implementar llamada a API
      // const response = await api.get('/tenants');
      // setTenants(response.data);
      
      // Por ahora, valores de ejemplo basados en la configuración actual
      setTenants([
        { slug: 'staging-centinelas-113', name: 'Staging Centinelas 113' },
        { slug: 'region-valle', name: 'Región Valle' },
        { slug: 'region-antioquia', name: 'Región Antioquia' }
      ]);
    } catch (error) {
      console.error('Error obteniendo tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  return { tenants, loading, fetchTenants };
};

/**
 * Hook para validar que la configuración actual es válida
 */
export const useConfigValidation = () => {
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const config = useTenantConfig();

  useEffect(() => {
    const validationErrors: string[] = [];

    // Validar API URL
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      validationErrors.push('VITE_API_BASE_URL no está configurado');
    }

    // Validar configuración de tenant/group
    if (!config.isConfigured) {
      validationErrors.push(config.configError || 'Configuración de tenant/group no válida');
    }

    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
  }, [config]);

  return { isValid, errors, config };
};
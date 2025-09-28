import { apiClient } from './apiClient';

// Interface para tenant info
interface TenantInfo {
  slug: string;
  name: string;
  groups?: GroupInfo[];
}

interface GroupInfo {
  slug: string;
  name: string;
}

// Función para obtener tenants disponibles
export const getAvailableTenants = async (): Promise<TenantInfo[]> => {
  try {
    console.log('🔄 [TenantService] Obteniendo tenants disponibles');
    
    // Asumiendo que existe un endpoint para listar tenants
    const tenants = await apiClient.get<TenantInfo[]>('/api/tenants');
    
    console.log('✅ [TenantService] Tenants obtenidos:', tenants);
    return tenants;
  } catch (error) {
    console.warn('⚠️ [TenantService] No se pudieron obtener tenants:', error);
    
    // Fallback con valores comunes
    return [
      {
        slug: 'scouts-main',
        name: 'Grupo Scout Principal',
        groups: [
          { slug: 'group-1', name: 'Grupo 1' }
        ]
      }
    ];
  }
};

// Función para obtener grupos de un tenant
export const getAvailableGroups = async (tenantSlug: string): Promise<GroupInfo[]> => {
  try {
    console.log('🔄 [TenantService] Obteniendo grupos para tenant:', tenantSlug);
    
    const groups = await apiClient.get<GroupInfo[]>(`/api/tenants/${tenantSlug}/groups`);
    
    console.log('✅ [TenantService] Grupos obtenidos:', groups);
    return groups;
  } catch (error) {
    console.warn('⚠️ [TenantService] No se pudieron obtener grupos:', error);
    
    // Fallback
    return [
      { slug: 'group-1', name: 'Grupo 1' }
    ];
  }
};
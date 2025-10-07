import api from "@/api/axios";

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
    
  const response = await api.get<TenantInfo[]>('/api/tenants');
  const tenants = response.data;
    
  console.log('✅ [TenantService] Tenants obtenidos:', tenants);
  return tenants;
  } catch (error) {
    console.warn('⚠️ [TenantService] No se pudieron obtener tenants:', error);
    
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
    
  const response = await api.get<GroupInfo[]>(`/api/tenants/${tenantSlug}/groups`);
  const groups = response.data;
    
  console.log('✅ [TenantService] Grupos obtenidos:', groups);
  return groups;
  } catch (error) {
    console.warn('⚠️ [TenantService] No se pudieron obtener grupos:', error);
    
    return [
      { slug: 'group-1', name: 'Grupo 1' }
    ];
  }
};
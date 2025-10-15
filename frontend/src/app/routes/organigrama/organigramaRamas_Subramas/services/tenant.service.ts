import { getAllTenants, getGroupsByTenant } from '@/api/organigramaApi';

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
    const tenants = await getAllTenants();
    console.log(' [TenantService] Tenants obtenidos:', tenants);
    return tenants as TenantInfo[];
  } catch (error) {
    console.warn(' [TenantService] No se pudieron obtener tenants:', error);
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
export const getAvailableGroups = async (tenantId: string): Promise<GroupInfo[]> => {
  try {
    console.log('🔄 [TenantService] Obteniendo grupos para tenant:', tenantId);
    const groups = await getGroupsByTenant(tenantId);
    console.log('✅ [TenantService] Grupos obtenidos:', groups);
    return groups as GroupInfo[];
  } catch (error) {
    console.warn('⚠️ [TenantService] No se pudieron obtener grupos:', error);
    return [
      { slug: 'group-1', name: 'Grupo 1' }
    ];
  }
};
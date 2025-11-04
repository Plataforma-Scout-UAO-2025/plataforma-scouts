import { useState, useEffect } from 'react';
import { useTenantParams } from '@/app/routes/organigrama/organigramaRamas_Subramas/hooks/useTenantParams';
import { getGroupsByTenant } from '@/api/organigramaApi';

interface UseGroupInfoReturn {
  groupName: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener la información del grupo asociado al tenant actual del usuario logueado
 */
export function useGroupInfo(): UseGroupInfoReturn {
  const { tenantId, isLoading: tenantLoading } = useTenantParams();
  const [groupName, setGroupName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || tenantLoading) {
      setGroupName(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchGroupInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const groups = await getGroupsByTenant(tenantId, controller.signal);
        
        if (!isMounted) return;
        
        // Según la lógica del backend, cada tenant tiene solo un grupo
        if (groups && groups.length > 0) {
          setGroupName(groups[0].name);
        } else {
          setGroupName(null);
          setError('No se encontró grupo para este tenant');
        }
      } catch (err) {
        if (!isMounted) return;
        
        const error = err as { name?: string };
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') {
          return; // Request was cancelled
        }
        
        console.error('Error fetching group info:', err);
        setError('Error al cargar información del grupo');
        setGroupName(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchGroupInfo();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tenantId, tenantLoading]);

  return {
    groupName,
    loading: loading || tenantLoading,
    error,
  };
}
import { useMemo } from 'react';

// Hook para obtener el tenant ID
// Por ahora es estático, pero se puede hacer dinámico cuando se implemente la gestión de tenants
export const useTenant = () => {
  const tenantId = useMemo(() => {
    // TODO: Obtener dinámicamente del contexto de autenticación o configuración
    // Por ahora usamos el mismo tenant ID que aparece en los archivos de Bruno
    return 'org_6B3k4dao2Wf6eGxa';
  }, []);

  return { tenantId };
};

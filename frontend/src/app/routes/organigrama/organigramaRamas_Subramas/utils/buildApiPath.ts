export const buildApiPath = (
  tenantId: string | undefined,
  groupSlug: string | undefined,
  resource: string,
  ...additionalPaths: string[]
): string => {
  if (!tenantId || !groupSlug) {
    throw new Error('TenantId y groupSlug son requeridos para construir la ruta.');
  }
  const basePath = `tenants/${tenantId}/groups/${groupSlug}`;
  const fullPath = [basePath, resource, ...additionalPaths].filter(Boolean).join('/');
  return fullPath;
};

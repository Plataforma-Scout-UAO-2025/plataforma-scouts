import api from "./axios";

type SlugPair = {
  tenant: string;
  group: string;
};

const resolveSlugs = (tenantSlug?: string, groupSlug?: string): SlugPair => {
  if (!tenantSlug || tenantSlug.trim().length === 0) {
    throw new Error('Se requiere tenantSlug para construir la ruta del organigrama.');
  }

  if (!groupSlug || groupSlug.trim().length === 0) {
    throw new Error('Se requiere groupSlug para construir la ruta del organigrama.');
  }

  return { tenant: tenantSlug, group: groupSlug };
};

export const getAllTenants = async <T = unknown>() => {
  const { data } = await api.get<T[]>("/tenants");
  return data;
};

export const getTenantBySlug = async <T = unknown>(tenantSlug: string) => {
  const { data } = await api.get<T>(`/tenants/${encodeURIComponent(tenantSlug)}`);
  return data;
};

export const getGroupsByTenant = async <T = unknown>(tenantSlug: string) => {
  const { data } = await api.get<T[]>(`/tenants/${encodeURIComponent(tenantSlug)}/groups`);
  return data;
};

export const getGroupBySlug = async <T = unknown>(tenantSlug: string, groupSlug: string) => {
  const { data } = await api.get<T>(
    `/tenants/${encodeURIComponent(tenantSlug)}/groups/${encodeURIComponent(groupSlug)}`
  );
  return data;
};

export const sectionsPath = (tenantSlug: string, groupSlug: string) => {
  const { tenant, group } = resolveSlugs(tenantSlug, groupSlug);
  return `/tenants/${encodeURIComponent(tenant)}/groups/${encodeURIComponent(group)}/sections`;
};

export const sectionPath = (sectionId: string | number, tenantSlug: string, groupSlug: string) =>
  `${sectionsPath(tenantSlug, groupSlug)}/${encodeURIComponent(String(sectionId))}`;

export const sectionWithSubgroupsPath = (sectionId: string | number, tenantSlug: string, groupSlug: string) =>
  `${sectionPath(sectionId, tenantSlug, groupSlug)}/with-subgroups`;

export const subgroupsPath = (sectionId: string | number, tenantSlug: string, groupSlug: string) =>
  `${sectionPath(sectionId, tenantSlug, groupSlug)}/subgroups`;

export const subgroupPath = (
  sectionId: string | number,
  subgroupId: string | number,
  tenantSlug: string,
  groupSlug: string
) => `${subgroupsPath(sectionId, tenantSlug, groupSlug)}/${encodeURIComponent(String(subgroupId))}`;

export const getSections = async <T = unknown>(tenantSlug: string, groupSlug: string) => {
  const { data } = await api.get<T[]>(sectionsPath(tenantSlug, groupSlug));
  return data;
};

export const getSection = async <T = unknown>(sectionId: string | number, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.get<T>(sectionPath(sectionId, tenantSlug, groupSlug));
  return data;
};

export const getSectionWithSubgroups = async <T = unknown>(sectionId: string | number, tenantSlug: string, groupSlug: string, signal?: AbortSignal) => {
  const config = signal ? { signal } : undefined;
  const { data } = await api.get<T>(sectionWithSubgroupsPath(sectionId, tenantSlug, groupSlug), config);
  return data;
};

export const createSection = async <T = unknown>(payload: unknown, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.post<T>(sectionsPath(tenantSlug, groupSlug), payload);
  return data;
};

export const updateSection = async <T = unknown>(sectionId: string | number, payload: unknown, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.put<T>(sectionPath(sectionId, tenantSlug, groupSlug), payload);
  return data;
};

export const deleteSection = async (sectionId: string | number, tenantSlug: string, groupSlug: string) => {
  await api.delete(sectionPath(sectionId, tenantSlug, groupSlug));
};

export const getSubgroups = async <T = unknown>(sectionId: string | number, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.get<T[]>(subgroupsPath(sectionId, tenantSlug, groupSlug));
  return data;
};

export const createSubgroup = async <T = unknown>(sectionId: string | number, payload: unknown, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.post<T>(subgroupsPath(sectionId, tenantSlug, groupSlug), payload);
  return data;
};

export const updateSubgroup = async <T = unknown>(sectionId: string | number, subgroupId: string | number, payload: unknown, tenantSlug: string, groupSlug: string) => {
  const { data } = await api.put<T>(subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug), payload);
  return data;
};

export const deleteSubgroup = async (sectionId: string | number, subgroupId: string | number, tenantSlug: string, groupSlug: string) => {
  await api.delete(subgroupPath(sectionId, subgroupId, tenantSlug, groupSlug));
};
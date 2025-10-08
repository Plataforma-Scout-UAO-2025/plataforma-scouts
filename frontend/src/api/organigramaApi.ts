import api from "./axios";

type SlugPair = {
  tenant: string;
  group: string;
};

const resolveSlugs = (tenantSlug?: string, groupSlug?: string): SlugPair => {
  const envTenant = import.meta.env.VITE_TENANT_SLUG;
  const envGroup = import.meta.env.VITE_GROUP_SLUG;
  const tenant = tenantSlug ?? envTenant;
  const group = groupSlug ?? envGroup;

  if (!tenant || tenant === "tu-tenant-aqui") {
    throw new Error("VITE_TENANT_SLUG no está configurado. Revisa tu archivo .env.local");
  }

  if (!group || group === "tu-grupo-scout-aqui") {
    throw new Error("VITE_GROUP_SLUG no está configurado. Revisa tu archivo .env.local");
  }

  return { tenant, group };
};

const sectionsUrl = (tenantSlug?: string, groupSlug?: string) => {
  const { tenant, group } = resolveSlugs(tenantSlug, groupSlug);
  return `/tenants/${tenant}/groups/${group}/sections`;
};

const subgroupsUrl = (sectionId: number, tenantSlug?: string, groupSlug?: string) =>
  `${sectionsUrl(tenantSlug, groupSlug)}/${sectionId}/subgroups`;

export const getSections = async <T = unknown>(tenantSlug?: string, groupSlug?: string) => {
  const { data } = await api.get<T[]>(sectionsUrl(tenantSlug, groupSlug));
  return data;
};

export const getSection = async <T = unknown>(
  sectionId: number,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.get<T>(`${sectionsUrl(tenantSlug, groupSlug)}/${sectionId}`);
  return data;
};

export const createSection = async <T = unknown>(
  payload: unknown,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.post<T>(sectionsUrl(tenantSlug, groupSlug), payload);
  return data;
};

export const updateSection = async <T = unknown>(
  sectionId: number,
  payload: unknown,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.put<T>(`${sectionsUrl(tenantSlug, groupSlug)}/${sectionId}`, payload);
  return data;
};

export const deleteSection = async (
  sectionId: number,
  tenantSlug?: string,
  groupSlug?: string
) => {
  await api.delete(`${sectionsUrl(tenantSlug, groupSlug)}/${sectionId}`);
};

export const getSubgroups = async <T = unknown>(
  sectionId: number,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.get<T[]>(subgroupsUrl(sectionId, tenantSlug, groupSlug));
  return data;
};

export const createSubgroup = async <T = unknown>(
  sectionId: number,
  payload: unknown,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.post<T>(subgroupsUrl(sectionId, tenantSlug, groupSlug), payload);
  return data;
};

export const updateSubgroup = async <T = unknown>(
  sectionId: number,
  subgroupId: number,
  payload: unknown,
  tenantSlug?: string,
  groupSlug?: string
) => {
  const { data } = await api.put<T>(`${subgroupsUrl(sectionId, tenantSlug, groupSlug)}/${subgroupId}`, payload);
  return data;
};

export const deleteSubgroup = async (
  sectionId: number,
  subgroupId: number,
  tenantSlug?: string,
  groupSlug?: string
) => {
  await api.delete(`${subgroupsUrl(sectionId, tenantSlug, groupSlug)}/${subgroupId}`);
};
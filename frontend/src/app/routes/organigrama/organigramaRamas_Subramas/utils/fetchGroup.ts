import api from '@/api/axios';
import type { BackendGroupSummary } from '../types/tenant';
import { extractCandidateValue } from './tenantUtils';

export const fetchDefaultGroupForTenant = async (
  tenantId: string,
  signal?: AbortSignal,
): Promise<string | undefined> => {
  const { data } = await api.get<BackendGroupSummary[]>(`/tenants/${encodeURIComponent(tenantId)}/groups`, { signal });
  const slugCandidate = data
    ?.map((group) => extractCandidateValue(group.slug ?? group.groupSlug ?? group['group_slug']))
    .find((slug): slug is string => Boolean(slug));
  return slugCandidate;
};

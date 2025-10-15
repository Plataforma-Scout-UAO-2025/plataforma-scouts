import { getGroupsByTenant } from '@/api/organigramaApi';
import { extractCandidateValue } from './tenantUtils';
import type { GroupResponseDTO } from '@/types/group.type';

export const fetchDefaultGroupForTenant = async (
  tenantId: string,
  signal?: AbortSignal,
): Promise<string | undefined> => {
  const data = await getGroupsByTenant(tenantId, signal);
  const slugCandidate = data
    ?.map((group: GroupResponseDTO) => extractCandidateValue(group.slug))
    .find((slug: string | undefined): slug is string => Boolean(slug));
  return slugCandidate;
};

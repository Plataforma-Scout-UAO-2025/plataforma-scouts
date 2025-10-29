import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchSubgroupMembersAction } from '@/store/organigrama/organigramaActions';
import type { Member } from '@/types/member.type';
import { fetchMembersWithBranchAction } from '@/store/members/membersActions';

// Member helpers
export const getMemberFullName = (member: Member & Record<string, unknown>): string => {
  // Handle full_name from Swagger response
  if (member.full_name) return member.full_name as string;
  
  // Build from firstName/lastName or first_name/last_name
  const firstName = member.firstName || member.first_name || '';
  const lastName = member.lastName || member.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Sin nombre';
};

export const getMemberId = (member: Member & Record<string, unknown>): number => {
  return (member.member_id as number) || member.memberId || (member.id as number) || 0;
};

export const isMemberActiveAndApproved = (member: Member): boolean => {
  const isActive = member.is_active ?? member.isActive ?? true;
  const isApproved = member.status === 'APPROVED';
  return isActive && isApproved;
};

export const isMemberScouter = (member: Member): boolean => {
  return member.role === 'SCOUTER';
};

interface UseSubgroupMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: (subgroupId: number) => Promise<Member[]>;
}

export const useSubgroupMembers = (subgroupId?: number): UseSubgroupMembersReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const triedGlobalFetchRef = useRef(false);
  
  // Get members data from Redux store
  const subgroupData = useSelector((state: RootState) => {
    if (!subgroupId) return { members: [], loading: false, error: null };
    return state.organigrama.subgroupMembers[subgroupId] || { members: [], loading: false, error: null };
  });

  // Global members (used for fallback when subgroup endpoint is forbidden for SCOUTER)
  const allMembers = useSelector((state: RootState) => state.members.members);

  // Helper to get subgroup id from Member with different shapes
  const toNumberSafe = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const getMemberSubgroupId = useCallback((m: Member): number | undefined => {
    // Soporta variantes camelCase y snake_case
    const direct = m.subgroup_id;
    const nestedCamel = m.subgroup?.subgroupId;
    const nestedSnake = m.subgroup?.subgroup_id;
    return toNumberSafe(direct ?? nestedCamel ?? nestedSnake);
  }, []);

  // Derive fallback members by filtering global members by subgroupId
  const derivedMembers = useMemo<Member[]>(() => {
    const sgNum = toNumberSafe(subgroupId);
    if (!sgNum || !Array.isArray(allMembers) || allMembers.length === 0) return [];
    return allMembers.filter((m) => getMemberSubgroupId(m) === sgNum);
  }, [allMembers, subgroupId, getMemberSubgroupId]);

  // If subgroup response is empty or errored (e.g., 403), try to fetch global members once
  useEffect(() => {
    if (!subgroupId) return;
    const noSubgroupMembers = !subgroupData.members || subgroupData.members.length === 0;
    const hasError = Boolean(subgroupData.error);
    const needFallback = noSubgroupMembers || hasError;
    if (!needFallback) return;

    // If we already have global members, no need to fetch
    if (Array.isArray(allMembers) && allMembers.length > 0) return;
    if (triedGlobalFetchRef.current) return;

    triedGlobalFetchRef.current = true;
    setFallbackLoading(true);
    (async () => {
      try {
        // Prefer the enriched endpoint that includes relationships
        const action = await dispatch(fetchMembersWithBranchAction());
        if (fetchMembersWithBranchAction.rejected.match(action)) {
          // swallow error, UI will still show derived members if any
        }
      } finally {
        setFallbackLoading(false);
      }
    })();
  }, [subgroupId, subgroupData.members, subgroupData.error, allMembers, dispatch]);

  // Function to fetch members using Redux action
  const fetchMembers = useCallback(async (targetSubgroupId: number): Promise<Member[]> => {
    try {
      const result = await dispatch(fetchSubgroupMembersAction(targetSubgroupId));
      
      if (fetchSubgroupMembersAction.fulfilled.match(result)) {
        return result.payload.members as Member[];
      } else {
        throw new Error(result.payload as string || 'Error fetching members');
      }
    } catch (error) {
      console.error('Error fetching subgroup members:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    // Prefer server subgroup members; fallback to derived ones if missing/forbidden
    members: (subgroupData.members && subgroupData.members.length > 0)
      ? subgroupData.members
      : derivedMembers,
    loading: subgroupData.loading || fallbackLoading,
    error: (derivedMembers && derivedMembers.length > 0) ? null : subgroupData.error,
    fetchMembers,
  };
};

export default useSubgroupMembers;
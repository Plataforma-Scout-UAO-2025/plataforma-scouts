import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchSubgroupMembersAction } from '@/store/organigrama/organigramaActions';
import type { Member } from '@/types/member.type';

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
  
  // Get members data from Redux store
  const subgroupData = useSelector((state: RootState) => {
    if (!subgroupId) return { members: [], loading: false, error: null };
    return state.organigrama.subgroupMembers[subgroupId] || { members: [], loading: false, error: null };
  });

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
    members: subgroupData.members,
    loading: subgroupData.loading,
    error: subgroupData.error,
    fetchMembers,
  };
};

export default useSubgroupMembers;
import { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchMembersInChargeAction } from "@/store/guardians/guardiansActions";

export const useMembersInChargeOf = (guardianId?: number) => {
  const dispatch = useAppDispatch();
  
  const guardianState = useAppSelector((state) => state.guardians);

  const fetchMembers = useCallback(() => {
    if (guardianId && guardianId > 0) {
      dispatch(fetchMembersInChargeAction(guardianId));
    }
  }, [guardianId, dispatch]);

  const refetch = useCallback(async () => {
    fetchMembers();
    return Promise.resolve();
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const membersInCharge = guardianState.members || []; 

  return {
    members: membersInCharge,
    guardianId: guardianId,
    loading: guardianState.loading || false,
    error: guardianState.error || null,
    refetch 
  };
};
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchMembersInChargeAction } from "@/store/guardians/guardiansActions";
import { useGuardian } from "./useGuardian";
import type { MemberBasicInfo } from "@/types/guardian.type";

interface GuardianState {
  id?: number;
  memberId?: number;
  loading?: boolean;
  error?: string | null;
  members?: MemberBasicInfo[];
  membersInCharge?: MemberBasicInfo[];
}

export const useMembersInChargeOf = (guardianId?: number) => {
  const dispatch = useAppDispatch();
  const guardianState = useGuardian() as GuardianState;

  const currentGuardianId = guardianId || 309;

  useEffect(() => {
    if (currentGuardianId) {
      dispatch(fetchMembersInChargeAction(currentGuardianId));
    }
  }, [currentGuardianId, dispatch]);

  const membersInCharge = guardianState.members || [];

  console.log("Guardian state completo:", guardianState);
  console.log("Members from Redux state:", membersInCharge);

  return {
    members: membersInCharge,
    guardianId: currentGuardianId,
    loading: guardianState.loading,
    error: guardianState.error
  };
};
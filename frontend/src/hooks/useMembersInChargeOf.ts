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

  useEffect(() => {
    // Solo hacer fetch si tenemos un guardianId válido
    if (guardianId && guardianId > 0) {
      console.log("Fetching members for guardian ID:", guardianId);
      dispatch(fetchMembersInChargeAction(guardianId));
    } else {
      console.log("No guardian ID provided, skipping fetch");
    }
  }, [guardianId, dispatch]);

  const membersInCharge = guardianState.members || [];

  console.log("Guardian ID received:", guardianId);
  console.log("Guardian state completo:", guardianState);
  console.log("Members from Redux state:", membersInCharge);

  return {
    members: membersInCharge,
    guardianId: guardianId,
    loading: guardianState.loading || false,
    error: guardianState.error || null
  };
};
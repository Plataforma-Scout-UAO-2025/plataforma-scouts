import { useEffect, useCallback } from "react";
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

  // Función para hacer fetch de los miembros
  const fetchMembers = useCallback(() => {
    if (guardianId && guardianId > 0) {
      console.log("Fetching members for guardian ID:", guardianId);
      dispatch(fetchMembersInChargeAction(guardianId));
    } else {
      console.log("No guardian ID provided, skipping fetch");
    }
  }, [guardianId, dispatch]);

  // Función refetch que devuelve una Promise para compatibilidad
  const refetch = useCallback(async () => {
    fetchMembers();
    // Retornar una promise vacía para mantener compatibilidad
    return Promise.resolve();
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const membersInCharge = guardianState.members || [];

  console.log("Guardian ID received:", guardianId);
  console.log("Guardian state completo:", guardianState);
  console.log("Members from Redux state:", membersInCharge);

  return {
    members: membersInCharge,
    guardianId: guardianId,
    loading: guardianState.loading || false,
    error: guardianState.error || null,
    refetch // Agregamos la función refetch
  };
};
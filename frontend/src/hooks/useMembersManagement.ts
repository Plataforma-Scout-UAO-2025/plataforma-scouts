import { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import { useMember } from "./useMember";

export const useMembersManagement = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useMember();

  const fetchMembers = useCallback(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const scoutMembers = members.filter(
    (member) => member.role?.toUpperCase() === "SCOUT"
  );

  const branchMembers: string[] = [];
  const branchMemberCount: Record<string, number> = {};
  const branchTotalMembers: string[] = [];
  const branchTotalMemberCount: Record<string, number> = {};

  for (const member of scoutMembers) {
    let sectionName = "Sin Rama";

    if (member.subgroup?.section?.name) {
      sectionName = member.subgroup.section.name;
      if (!branchMembers.includes(sectionName)) {
        branchMembers.push(sectionName);
      }
    } else if (!branchMembers.includes("Sin Rama")) {
      branchMembers.push("Sin Rama");
    }

    branchMemberCount[sectionName] = (branchMemberCount[sectionName] || 0) + 1;
  }

  const approvedMembers = members.filter(
    (member) => member.status?.toLowerCase() === "approved"
  );
  for (const member of approvedMembers) {
    let sectionName = "Sin Rama";

    if (member.subgroup?.section?.name) {
      sectionName = member.subgroup.section.name;
      if (!branchTotalMembers.includes(sectionName)) {
        branchTotalMembers.push(sectionName);
      }
    } else if (!branchTotalMembers.includes("Sin Rama")) {
      branchTotalMembers.push("Sin Rama");
    }

    branchTotalMemberCount[sectionName] =
      (branchTotalMemberCount[sectionName] || 0) + 1;
  }

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const nuevosEsteMes = members.filter((member) => {
    const dateValue = member.createdAt || member.created_at;
    if (!dateValue) {
      return false;
    }
    const fecha = new Date(dateValue as string);
    return (
      fecha >= inicioMes &&
      fecha <= ahora &&
      member.status?.toUpperCase() === "APPROVED"
    );
  }).length;

  return {
    members,
    scoutMembers,
    branchMemberCount,
    branchTotalMemberCount,
    branchMembers,
    nuevosEsteMes,

    loading,
    error,
    refreshMembers: fetchMembers,
  };
};

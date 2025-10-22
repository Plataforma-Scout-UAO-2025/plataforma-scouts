import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import { useMember } from "./useMember";

export const useMembersManagement = () => {
  const dispatch = useAppDispatch();
  const { members } = useMember();

  useEffect(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

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

  for (const member of members) {
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
    const fecha = new Date(member.createdAt || (member.created_at as string));
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
  };
};

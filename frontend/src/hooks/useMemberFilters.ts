import { useState, useMemo } from "react";
import type { Member } from "@/types/member.type";
import { useMembersManagement } from "./useMembersManagement";

interface useMemberFiltersProps {
  itemsPerPage?: number;
}

export const useMemberFilters = ({
  itemsPerPage = 10,
}: useMemberFiltersProps = {}) => {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { members, branchMembers, branchTotalMemberCount } =
    useMembersManagement();

  const filteredMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    return members
      .filter((member: Member) => {
        const status = (member.status ?? "").toLowerCase();
        if (status !== "approved") return false;

        const fullName = `${member.firstName ?? member.first_name ?? ""} ${
          member.lastName ?? member.last_name ?? ""
        }`.toLowerCase();
        const identification = (member.identification ?? "").toLowerCase();
        const matchesSearch =
          !searchFilter.toLowerCase() ||
          fullName.includes(searchFilter.toLowerCase()) ||
          identification.includes(searchFilter.toLowerCase());

        const matchesStatus =
          !isActiveFilter.toLowerCase() ||
          (member.isActive || member.is_active ? "activo" : "inactivo") ===
            isActiveFilter.toLowerCase();

        const matchesBranch =
          !branchFilter.toLowerCase() ||
          (() => {
            const subgroupField = (member as unknown as Record<string, unknown>)
              .subgroup;

            if (branchFilter.toLowerCase() === "sin rama") {
              return (
                !subgroupField ||
                typeof subgroupField !== "object" ||
                !(subgroupField as Record<string, unknown>).section
              );
            }

            const section =
              subgroupField && typeof subgroupField === "object"
                ? (subgroupField as Record<string, unknown>).section
                : undefined;

            if (!section) return false;

            if (Array.isArray(section)) {
              return section.some((s) =>
                ((s as Record<string, unknown>)?.name ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(branchFilter.toLowerCase())
              );
            }

            return ((section as Record<string, unknown>)?.name ?? "")
              .toString()
              .toLowerCase()
              .includes(branchFilter.toLowerCase());
          })();

        return matchesSearch && matchesStatus && matchesBranch;
      })
      .map(
        (member) =>
          ({
            ...member,
            is_active: member.isActive ?? member.is_active ?? false,
          } as Member)
      );
  }, [members, searchFilter, isActiveFilter, branchFilter]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) =>
      totalPages < 1 ? 1 : Math.min(prev + 1, totalPages)
    );
  };

  return {
    // Filtros
    searchFilter,
    setSearchFilter,
    isActiveFilter,
    setIsActiveFilter,
    branchFilter,
    setBranchFilter,

    // Datos
    filteredMembers,
    paginatedMembers,
    members: members || [],
    totalMembers: members.filter((member) => {
      return member.status?.toLowerCase() === "approved";
    }).length,
    branchMembers,
    branchTotalMemberCount,

    // Paginación
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
  };
};

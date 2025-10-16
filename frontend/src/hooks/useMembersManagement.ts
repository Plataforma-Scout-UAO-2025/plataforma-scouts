import { useState, useMemo, useEffect, useRef } from "react";
import type { Member } from "@/types/member.type";
import { useMember } from "@/hooks/useMember";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import { clearNotification } from "@/store/members/membersSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useTenant } from "@/hooks/useTenant";

const toStr = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const parseIsActive = (raw: unknown): boolean => {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string") {
    const v = raw.toLowerCase().trim();
    return v === "activo" || v === "true" || v === "1";
  }
  return false;
};

interface UseMembersManagementProps {
  itemsPerPage?: number;
}

export const useMembersManagement = ({
  itemsPerPage = 10,
}: UseMembersManagementProps = {}) => {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const dispatch = useAppDispatch();
  const { members, error, message, loading } = useMember();
  const tenantId = useTenant();
  const fetchedTenantsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!tenantId) return;
    if (fetchedTenantsRef.current[tenantId]) return;

    fetchedTenantsRef.current[tenantId] = true;
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch, tenantId]);

  // helpers moved to module-scope to avoid recreating on every render
  const filteredMembers = useMemo(() => {
    if (!members || members.length === 0) return [];

    const searchLower = searchFilter.toLowerCase();
    const activeFilterLower = isActiveFilter.toLowerCase();
    const branchLower = branchFilter.toLowerCase();

    return members
      .filter((member: Member) => {
        const m = member as unknown as Record<string, unknown>;
        const status = toStr(
          member.status ?? m.member_status ?? m.approval_status
        ).toLowerCase();
        if (status !== "approved") return false;

        if (toStr(m.tenant_id ?? m.tenantId) !== tenantId) return false;

        const fullName = `${toStr(m.first_name)} ${toStr(
          m.last_name
        )}`.toLowerCase();
        const identification = toStr(m.identification).toLowerCase();
        const matchesSearch =
          !searchLower ||
          fullName.includes(searchLower) ||
          identification.includes(searchLower);

        const rawIsActive = m.is_active ?? m.isActive;
        const isActive = parseIsActive(rawIsActive);
        const matchesStatus =
          !activeFilterLower ||
          (isActive ? "activo" : "inactivo") === activeFilterLower;

        const matchesBranch =
          !branchLower ||
          (() => {
            const subgroupField = (member as unknown as Record<string, unknown>)
              .subgroup;
            const section =
              subgroupField && typeof subgroupField === "object"
                ? (subgroupField as Record<string, unknown>).section
                : undefined;
            if (!section) return false;
            if (Array.isArray(section)) {
              return section.some((s) =>
                toStr((s as Record<string, unknown>)?.name)
                  .toLowerCase()
                  .includes(branchLower)
              );
            }
            return toStr((section as Record<string, unknown>)?.name)
              .toLowerCase()
              .includes(branchLower);
          })();

        return matchesSearch && matchesStatus && matchesBranch;
      })
      .map(
        (m) =>
          ({
            ...m,
            is_active: parseIsActive(
              (m as unknown as Record<string, unknown>).is_active ??
                (m as unknown as Record<string, unknown>).isActive
            ),
          } as Member)
      );
  }, [members, searchFilter, isActiveFilter, branchFilter, tenantId]);

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

  const extractSectionsFromMember = (member: Member): string[] => {
    const rec = member as unknown as Record<string, unknown>;
    const results = new Set<string>();

    const pushIfName = (val: unknown) => {
      if (val === null || val === undefined) return;
      if (Array.isArray(val)) return val.forEach((v) => pushIfName(v));
      if (typeof val === "string") return results.add(val.trim());
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const name =
          obj.name ?? obj.section ?? obj.section_name ?? obj.sectionName;
        if (typeof name === "string") return results.add(name.trim());
      }
    };

    pushIfName(rec["subgroup"]);
    pushIfName(rec["branch"]);
    pushIfName(rec["sectionName"]);
    pushIfName(rec["section_name"]);
    pushIfName(rec["section"]);

    const sg = (member as unknown as Record<string, unknown>).subgroup;
    if (sg) pushIfName((sg as Record<string, unknown>).section ?? sg);

    return Array.from(results).filter(Boolean);
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

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
    extractSectionsFromMember,
    totalMembers: members
      ? members.filter((m) => {
          const rec = m as Record<string, string>;
          const t = String(rec.tenant_id ?? rec.tenantId);
          return t === tenantId;
        }).length
      : 0,

    // Paginación
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,

    // Estados del store
    error,
    loading,
    message,
  };
};

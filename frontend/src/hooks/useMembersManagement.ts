import { useState, useMemo, useEffect, useRef } from "react";
import type { Member } from "@/types/member.type";
import { useMember } from "@/hooks/useMember";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import { clearNotification } from "@/store/members/membersSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useTenant } from "@/hooks/useTenant";

interface UseMembersManagementProps {
  itemsPerPage?: number;
}

const mappingStatus = (isActive: boolean | undefined): string => {
  if (isActive === undefined || isActive === null) return "Inactivo";
  return isActive ? "Activo" : "Inactivo";
};

export const useMembersManagement = ({
  itemsPerPage = 10,
}: UseMembersManagementProps = {}) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredMembers = useMemo(() => {
    if (!members || !members.length) return [];

    const filtered = members.filter((member: Member) => {
      const memberRec = member as unknown as Record<string, unknown>;
      const memberTenantId = (memberRec["tenant_id"] ??
        memberRec["tenantId"]) as string | undefined;
      const matchesTenant = memberTenantId === tenantId;
      const firstName = (memberRec["first_name"] ??
        memberRec["firstName"] ??
        "") as string;
      const lastName = (memberRec["last_name"] ??
        memberRec["lastName"] ??
        "") as string;
      const identification = (memberRec["identification"] ?? "") as string;

      const matchesSearch =
        searchFilter === "" ||
        firstName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        lastName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        identification?.toLowerCase().includes(searchFilter.toLowerCase());

      const isActiveField = (memberRec["is_active"] ??
        memberRec["isActive"]) as boolean | undefined;
      const matchesStatus =
        statusFilter === "" ||
        mappingStatus(isActiveField)
          .toLowerCase()
          .includes(statusFilter.toLowerCase());

      const matchesBranch =
        branchFilter === "" ||
        (Array.isArray(member?.subgroup?.section)
          ? member?.subgroup?.section?.some((section) =>
              section?.name?.toLowerCase().includes(branchFilter.toLowerCase())
            )
          : member?.subgroup?.section?.name
              ?.toLowerCase()
              .includes(branchFilter.toLowerCase()));

      return matchesTenant && matchesSearch && matchesStatus && matchesBranch;
    });

    // Mapear a formato de tabla, traducir estados y normalizar nombres de campo
    return filtered.map((member: Member): Member => {
      const normalized: Record<string, unknown> = { ...member } as Record<
        string,
        unknown
      >;

      const memberRec = member as unknown as Record<string, unknown>;
      const memberId = (memberRec["member_id"] ?? memberRec["memberId"]) as
        | number
        | undefined;
      const firstName = (memberRec["first_name"] ??
        memberRec["firstName"] ??
        "") as string;
      const lastName = (memberRec["last_name"] ??
        memberRec["lastName"] ??
        "") as string;
      const createdAt = (memberRec["created_at"] ??
        memberRec["createdAt"] ??
        null) as string | null;
      const address = (memberRec["address"] ??
        memberRec["address"] ??
        "") as string;
      const isActive = (memberRec["is_active"] ?? memberRec["isActive"]) as
        | boolean
        | undefined;

      normalized["member_id"] = memberId;
      normalized["first_name"] = firstName;
      normalized["last_name"] = lastName;
      normalized["created_at"] = createdAt;
      normalized["address"] = address;
      normalized["status"] = mappingStatus(isActive);

      return normalized as Member;
    });
  }, [members, searchFilter, statusFilter, branchFilter, tenantId]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, statusFilter, branchFilter]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) =>
      totalPages < 1 ? 1 : Math.min(prev + 1, totalPages)
    );
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  const extractSectionsFromMember = (member: Member): string[] => {
    const names: string[] = [];
    try {
      const rec = member as unknown as Record<string, unknown>;
      // subgroup.section (obj or array)
      const subgroup = rec["subgroup"] as unknown;
      if (subgroup) {
        if (Array.isArray(subgroup)) {
          for (const sg of subgroup) {
            const sec = (sg as Record<string, unknown>)?.section as unknown;
            if (Array.isArray(sec)) {
              for (const s of sec)
                if (s && (s as Record<string, unknown>).name)
                  names.push(String((s as Record<string, unknown>).name));
            } else if (sec && (sec as Record<string, unknown>).name)
              names.push(String((sec as Record<string, unknown>).name));
          }
        } else {
          const sec = (subgroup as Record<string, unknown>).section as unknown;
          if (Array.isArray(sec)) {
            for (const s of sec)
              if (s && (s as Record<string, unknown>).name)
                names.push(String((s as Record<string, unknown>).name));
          } else if (sec && (sec as Record<string, unknown>).name)
            names.push(String((sec as Record<string, unknown>).name));
        }
      }

      // legacy branch[]
      const branchArr = rec["branch"] as unknown;
      if (Array.isArray(branchArr)) {
        for (const b of branchArr)
          if (b && (b as Record<string, unknown>).name)
            names.push(String((b as Record<string, unknown>).name));
      }

      // direct fields
      if (rec["sectionName"] && typeof rec["sectionName"] === "string")
        names.push(String(rec["sectionName"]));
      if (rec["section_name"] && typeof rec["section_name"] === "string")
        names.push(String(rec["section_name"]));
      if (
        rec["section"] &&
        typeof rec["section"] === "object" &&
        (rec["section"] as Record<string, unknown>).name
      )
        names.push(String((rec["section"] as Record<string, unknown>).name));

      // fallback for older shape where subgroup?.section?.name exists directly on member
      const mrec = member as unknown as Record<string, unknown>;
      if (
        mrec.subgroup &&
        (mrec.subgroup as Record<string, unknown>)?.section &&
        (
          (mrec.subgroup as Record<string, unknown>).section as Record<
            string,
            unknown
          >
        ).name
      ) {
        names.push(
          String(
            (
              (mrec.subgroup as Record<string, unknown>).section as Record<
                string,
                unknown
              >
            ).name
          )
        );
      }
    } catch (err) {
      // log to help debugging but don't break UI
      console.debug("extractSectionsFromMember error:", err);
    }
    return names.map((s) => s.trim()).filter(Boolean);
  };

  return {
    // Estados de filtros
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    extractSectionsFromMember,

    // Datos de miembros
    filteredMembers,
    paginatedMembers,
    totalMembers: members
      ? members.filter((m) => {
          const rec = m as unknown as Record<string, unknown>;
          const t = (rec["tenant_id"] ?? rec["tenantId"]) as string | undefined;
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

    // Estados de la store
    error,
    loading,
    message,
  };
};

import { useEffect, useMemo, useState, useCallback } from "react";
import type { Member } from "@/types/member.type";
import type { Subgroup } from "@/types/subgroup.type";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { fetchMembersByStatusAction } from "@/store/members/membersActions";

type Status = "APPROVED" | "PENDING" | "REJECTED";

interface Options {
  status: Status;
  pageSize?: number;
  search?: string;
  branch?: string;
  phoneFilter?: string;
}

interface Return {
  members: Member[];
  total: number;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  loading: boolean;
  error: string | null;
  ready: boolean;
  refetch: () => void;
}

export function useTenantMembersByStatus({
  status,
  pageSize = 10,
  search = "",
  branch = "",
  phoneFilter = "",
}: Options): Return {
  const dispatch = useAppDispatch();
  const { orgId, isLoading: authLoading } = useAuth0ApiWrapper();
  const { members: storeMembers = [], loading, error } = useMember();

  const [page, setPage] = useState<number>(1);
  const [rev, setRev] = useState<number>(0);
  const ready = !authLoading;

  useEffect(() => {
    if (!ready) return;
    void dispatch(fetchMembersByStatusAction(status));
  }, [dispatch, status, ready, rev]);

  const tenantMembers: Member[] = useMemo(() => {
    if (!orgId) return storeMembers;
    return storeMembers.filter(
      (m: Member) => m.tenant_id === orgId || (m as unknown as { tenant_id?: string }).tenant_id === orgId
    );
  }, [storeMembers, orgId]);

  const filtered: Member[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const branchTerm = branch.trim().toLowerCase();
    const termPhone = phoneFilter.trim().toLowerCase();

    return tenantMembers.filter((m: Member) => {
      const bySearch =
        term === "" ||
        m.first_name?.toLowerCase().includes(term) ||
        m.last_name?.toLowerCase().includes(term) ||
        m.identification?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term);

      const byPhone = termPhone === "" || m.phone?.toLowerCase().includes(termPhone);

      const byBranch =
        branchTerm === "" ||
        (Array.isArray(m.branch) &&
          m.branch.some((b: Subgroup) => b.name.toLowerCase().includes(branchTerm)));

      return bySearch && byPhone && byBranch;
    });
  }, [tenantMembers, search, phoneFilter, branch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  useEffect(() => {
    setPage(1);
  }, [status, search, branch, phoneFilter, pageSize, orgId]);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage]);

  const refetch = useCallback(() => setRev((v) => v + 1), []);

  return {
    members: pageItems,
    total,
    page: safePage,
    totalPages,
    setPage,
    loading: Boolean(loading),
    error: typeof error === "string" ? error : null,
    ready,
    refetch,
  };
}

import { useState, useMemo, useEffect } from "react";
import type { Member } from "@/types/member.type";
import { useMember } from "@/hooks/useMember";
import { fetchMembersAction, fetchSubgroupByMemberIdAction } from "@/store/members/membersActions";
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

export const useMembersManagement = ({ itemsPerPage = 10 }: UseMembersManagementProps = {}) => {
  // Estados de filtros
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useAppDispatch();
  const { members, error, message } = useMember();
  const tenantId = useTenant();

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(fetchMembersAction());
  }, [dispatch]);

  // Obtener subgrupos de los miembros
  useEffect(() => {
    if (members && members.length > 0) {
      members.forEach((member) => {
        if (member.member_id !== undefined) {
          dispatch(fetchSubgroupByMemberIdAction(member.member_id));
        }
      });
    }
  }, [members, dispatch]);

  console.log(members);

  // Aplicar filtros y mapear a formato de tabla
  const filteredMembers = useMemo(() => {
    if (!members || !members.length) return [];

    const filtered = members.filter((member: Member) => {
      const matchesTenant = member.tenant_id === tenantId;

      const matchesSearch =
        searchFilter === "" ||
        member.first_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.identification
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "" ||
        mappingStatus(member.is_active)?.toLowerCase().includes(statusFilter.toLowerCase());

      const matchesBranch =
        branchFilter === "" ||
        member.branch?.some((branch) =>
          branch.name.toLowerCase().includes(branchFilter.toLowerCase())
        );

      return matchesTenant && matchesSearch && matchesStatus && matchesBranch;
    });

    // Mapear a formato de tabla y traducir estados
    return filtered.map(
      (member: Member): Member => ({
        ...member,
        status: mappingStatus(member.is_active),
      })
    );
  }, [members, searchFilter, statusFilter, branchFilter, tenantId]);

  console.log("Filtered Members:", filteredMembers);

  // Calcular la paginación
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, statusFilter, branchFilter]);

  // Funciones de navegación de páginas
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Limpiar mensajes después de mostrarlos
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  return {
    // Estados de filtros
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    
    // Datos de miembros
    filteredMembers,
    paginatedMembers,
    totalMembers: members?.filter(m => m.tenant_id === tenantId).length || 0,
    
    // Paginación
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
    
    // Estados de la store
    error,
    loading: !filteredMembers,
    message,
  };
};

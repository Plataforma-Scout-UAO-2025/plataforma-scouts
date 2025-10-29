import type { GroupResponseDTO as Group } from "@/types/group.type";
import { useEffect } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { fetchGroupsAction } from "@/store/groups/groupsActions";
import { isGroupActive } from "@/utils/groupStatus";
import { useGroup } from "./useGroup";

interface GroupStatus {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
  status?: string;
  name?: string;
  [key: string]: unknown;
}

export const useGroupManagement = () => {
  const dispatch = useAppDispatch();
  const { groups } = useGroup();

  useEffect(() => {
    // Solo fetch si no hay grupos cargados
    if (!groups || groups.length === 0) {
      dispatch(fetchGroupsAction());
    }
  }, [dispatch, groups]);

  // Usar la función utilitaria compartida con type assertion
  const isActive = (group: GroupStatus): boolean => {
    return isGroupActive(group as Group & Record<string, unknown>);
  };

  const handleViewInfo = (
    group: Group,
    setIsInfoModalOpen: (open: boolean) => void,
    setSelectedGroupInfo: (group: Group | null) => void
  ) => {
    setSelectedGroupInfo(group);
    setIsInfoModalOpen(true);
  };

  const handleAdminGroup = (
    group: Group,
    setIsAdminGroupOpen: (open: boolean) => void,
    setSelectedGroupAdmin: (group: Group | null) => void
  ) => {
    setSelectedGroupAdmin(group);
    setIsAdminGroupOpen(true);
  };

  const handleEditClick = (
    group: Group,
    setIsEditModalOpen: (open: boolean) => void,
    setSelectedGroupEdit: (group: Group | null) => void
  ) => {
    setSelectedGroupEdit(group);
    setIsEditModalOpen(true);
  };

  const handleCreateGroup = (setIsCreateModalOpen: (open: boolean) => void) => {
    setIsCreateModalOpen(true);
  };

  return {
    isActive,
    handleViewInfo,
    handleAdminGroup,
    handleEditClick,
    handleCreateGroup,
  };
};

import type { GroupResponseDTO as Group } from "@/types/group.type";

interface GroupStatus {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

export const useGroupManagement = () => {
  const isActive = (group: GroupStatus): boolean => {
    const value = group.isActive;
    if (typeof value === "string") {
      return value.toLowerCase() === "activo" || value.toLowerCase() === "true";
    }
    if (typeof value === "number") {
      return value === 1;
    }
    return Boolean(value);
  };

  const handleViewInfo = (group: Group, setIsInfoModalOpen: (open: boolean) => void, setSelectedGroupInfo: (group: Group | null) => void) => {
    setSelectedGroupInfo(group);
    setIsInfoModalOpen(true);
  };

  const handleAdminGroup = (group: Group, setIsAdminGroupOpen: (open: boolean) => void, setSelectedGroupAdmin: (group: Group | null) => void) => {
    setSelectedGroupAdmin(group);
    setIsAdminGroupOpen(true);
  }

  const handleEditClick = (group: Group, setIsEditModalOpen: (open: boolean) => void, setSelectedGroupEdit: (group: Group | null) => void) => {
    setSelectedGroupEdit(group);
    setIsEditModalOpen(true);
  };

  return {
    isActive,
    handleViewInfo,
    handleAdminGroup,
    handleEditClick,
  };
};

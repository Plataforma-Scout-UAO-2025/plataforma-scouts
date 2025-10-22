import { useState } from "react";
import type { Member } from "@/types/member.type";
import { toast } from "sonner";

interface MemberStatus {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

export const useMemberStatusDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);

  const isActive = (member: MemberStatus): boolean => {
    const value = member.is_active ?? member.isActive;
    if (typeof value === "string") {
      return value.toLowerCase() === "activo" || value.toLowerCase() === "true";
    }
    if (typeof value === "number") {
      return value === 1;
    }
    return Boolean(value);
  };

  const handleDeleteClick = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);

      // Pendiente integración con endpoint del backend
      console.log(
        `${isActive(selectedMember) ? "Desactivando" : "Activando"} miembro:`,
        selectedMember
      );

      setIsDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Error al cambiar estado del miembro:", error);
      toast.error(
        "Ocurrió un error al cambiar el estado del miembro. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedMember,
    loading,
    isActive,
    handleDeleteClick,
    handleConfirmToggle,
  };
};

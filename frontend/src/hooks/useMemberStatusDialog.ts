import { useState } from "react";
import type { Member } from "@/types/member.type";
import { toast } from "sonner";
import { useAppDispatch } from "./useAppDispatch";
import { updateMemberAction, fetchMembersByStatusAction } from "@/store/members/membersActions";

interface MemberStatus {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

export const useMemberStatusDialog = () => {
  const dispatch = useAppDispatch();
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
    if (!selectedMember || !selectedMember.member_id) return;

    try {
      setLoading(true);

      const newActiveStatus = !isActive(selectedMember);
      const memberName = `${selectedMember.first_name} ${selectedMember.last_name}`;
      const action = newActiveStatus ? "activado" : "desactivado";

      await dispatch(
        updateMemberAction({
          uid: selectedMember.member_id.toString(),
          updates: {
            isActive: newActiveStatus,
          },
        })
      ).unwrap();

      toast.success(`${memberName} fue ${action} exitosamente.`);

      await dispatch(fetchMembersByStatusAction("APPROVED"));

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

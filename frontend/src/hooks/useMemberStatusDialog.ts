import { useState } from "react";
import type { Member, UpdateMember } from "@/types/member.type";
import { toast } from "sonner";
import { useAppDispatch } from "./useAppDispatch";
import { updateMemberAction, fetchMembersWithBranchAction } from "@/store/members/membersActions";

type AnyMember = Member | UpdateMember;

interface MemberStatus {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

// Type guard para verificar si es UpdateMember
function isUpdateMember(member: AnyMember): member is UpdateMember {
  return 'memberId' in member && member.memberId !== undefined;
}

// Función para obtener el ID del miembro
function getMemberId(member?: AnyMember | null): number | undefined {
  if (!member) return undefined;
  
  if (isUpdateMember(member) && member.memberId !== undefined) {
    return member.memberId;
  }
  
  const regularMember = member as Member;
  if (regularMember.member_id !== undefined) {
    return regularMember.member_id;
  }
  
  return undefined;
}

// Función para obtener un campo que puede estar en camelCase o snake_case
function getMemberField(
  member: AnyMember,
  keyCamel: keyof UpdateMember,
  keySnake: keyof Member
): string {
  const updateMember = member as UpdateMember;
  const regularMember = member as Member;
  
  const camelValue = updateMember[keyCamel];
  const snakeValue = regularMember[keySnake];
  
  return String(camelValue ?? snakeValue ?? "");
}

export const useMemberStatusDialog = () => {
  const dispatch = useAppDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AnyMember | null>(null);
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

  const handleDeleteClick = (member: AnyMember) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedMember) {
      toast.error("No se ha seleccionado ningún miembro.");
      return;
    }

    const memberId = getMemberId(selectedMember);

    if (!memberId) {
      console.error("No se pudo identificar el ID del miembro:", selectedMember);
      toast.error("No se pudo identificar el ID del miembro.");
      return;
    }

    try {
      setLoading(true);

      const currentStatus = isActive(selectedMember);
      const newActiveStatus = !currentStatus;
      
      const firstName = getMemberField(selectedMember, "firstName", "first_name");
      const lastName = getMemberField(selectedMember, "lastName", "last_name");
      const memberName = `${firstName} ${lastName}`.trim();
      const action = newActiveStatus ? "activado" : "desactivado";

      console.log("Actualizando miembro:", {
        memberId,
        currentStatus,
        newActiveStatus,
        memberName
      });

      await dispatch(
        updateMemberAction({
          uid: String(memberId),
          updates: {
            isActive: newActiveStatus,
          },
        })
      ).unwrap();

      toast.success(`${memberName} fue ${action} exitosamente.`);

      // Refrescar la lista de miembros con branch
      await dispatch(fetchMembersWithBranchAction()).unwrap();

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
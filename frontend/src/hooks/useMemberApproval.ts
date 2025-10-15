import { useState } from "react";
import type { Member } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import {
  updateMemberStatusAction,
  updateMemberAction,
} from "@/store/members/membersActions";
import { toast } from "sonner";

interface UseMemberApprovalArgs {
  member: Member | null;
  selectedSection: string;
  selectedSubgroup: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function useMemberApproval({
  member,
  selectedSection,
  selectedSubgroup,
  onSuccess,
  onClose,
}: UseMemberApprovalArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const canAccept = Boolean(member && selectedSection);

  const accept = async () => {
    if (!member) return;
    if (!selectedSection) {
      toast.warning("Por favor, selecciona una rama antes de aceptar.");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        updateMemberStatusAction({
          id: member.member_id as string | number,
          status: "APPROVED",
        })
      ).unwrap();

      await dispatch(
        updateMemberAction({
          uid: String(member.member_id),
          updates: {
            section_id: Number(selectedSection),
            subgroup_id: selectedSubgroup
              ? Number(selectedSubgroup)
              : undefined,
          } as Partial<Member>,
        })
      ).unwrap();

      toast.success(
        `La solicitud de ${member.first_name} ${member.last_name} fue aprobada exitosamente.`
      );

      onClose();
      onSuccess();
    } catch (e: any) {
      console.error("Error al aceptar solicitud:", e);
      toast.error(
        e?.message ||
          "Ocurrió un error al procesar la solicitud. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, canAccept, accept };
}

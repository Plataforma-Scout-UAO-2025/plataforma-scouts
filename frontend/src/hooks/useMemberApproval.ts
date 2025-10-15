import { useState } from "react";
import type { Member, UpdateMember } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import {
  updateMemberStatusAction,
  updateMemberAction,
} from "@/store/members/membersActions";
import { toast } from "sonner";

type AnyMember = Member | UpdateMember;

function getMemberId(m?: AnyMember | null): number | undefined {
  if (!m) return undefined;
  const id =
    (m as UpdateMember).memberId ??
    (m as Member).member_id ??
    (m as unknown as { id?: number }).id;
  return typeof id === "string" ? Number(id) : id;
}

interface UseMemberApprovalArgs {
  member: AnyMember | null;
  selectedSection: string;
  selectedSubgroup: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function useMemberApproval({
  member,
  selectedSubgroup,
  onSuccess,
  onClose,
}: UseMemberApprovalArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const memberId = getMemberId(member);
  const canAccept = Boolean(memberId); // ahora no exige sección

  const accept = async () => {
    if (!memberId) {
      console.error("[useMemberApproval] memberId es undefined", member);
      toast.error("No se pudo identificar el miembro (ID inválido).");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        updateMemberStatusAction({
          id: memberId,
          status: "APPROVED",
        })
      ).unwrap();

      const updates: Partial<UpdateMember> = {};
      /*if (selectedSection) {
        updates.sectionId = Number(selectedSection);
      }*/
      if (selectedSubgroup) {
        updates.subgroupId = Number(selectedSubgroup);
      }

      if (Object.keys(updates).length > 0) {
        await dispatch(
          updateMemberAction({
            uid: String(memberId),
            updates,
          })
        ).unwrap();
      }

      const firstName =
        (member as UpdateMember).firstName ??
        (member as Member).first_name ??
        "";
      const lastName =
        (member as UpdateMember).lastName ?? (member as Member).last_name ?? "";

      toast.success(
        `La solicitud de ${firstName} ${lastName} fue aprobada exitosamente.`
      );

      onClose();
      onSuccess();
    } catch (e) {
      console.error("Error al aceptar solicitud:", e);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, canAccept, accept };
}

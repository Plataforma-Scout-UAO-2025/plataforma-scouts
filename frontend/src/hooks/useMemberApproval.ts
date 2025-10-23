import { useState } from "react";
import type { Member, UpdateMember } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import {
  updateMemberStatusAction,
  updateMemberAction,
  assignSubgroupAndSectionAction,
  updateMemberByDtoAction,
} from "@/store/members/membersActions";
import { toast } from "sonner";

type AnyMember = Member | UpdateMember;

function isUpdateMember(member: AnyMember): member is UpdateMember {
  return "memberId" in member && member.memberId !== undefined;
}

function hasGenericId(member: unknown): member is { id: number | string } {
  return (
    typeof member === "object" &&
    member !== null &&
    "id" in member &&
    (typeof (member as { id: unknown }).id === "number" ||
      typeof (member as { id: unknown }).id === "string")
  );
}

function getMemberId(m?: AnyMember | null): number | undefined {
  if (!m) return undefined;

  if (isUpdateMember(m) && m.memberId !== undefined) {
    return m.memberId;
  }

  const member = m as Member;
  if (member.member_id !== undefined) {
    return member.member_id;
  }

  if (hasGenericId(m)) {
    return typeof m.id === "string" ? Number(m.id) : m.id;
  }

  return undefined;
}

interface UseMemberApprovalArgs {
  member: AnyMember | null;
  selectedSection: string;
  selectedSubgroup?: string;
  selectedRole?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function useMemberApproval({
  member,
  selectedSubgroup,
  selectedSection,
  selectedRole,
  onSuccess,
  onClose,
}: UseMemberApprovalArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const memberId = getMemberId(member);
  const canAccept = Boolean(memberId);

  function getMemberField(
    keyCamel: keyof UpdateMember,
    keySnake: keyof Member
  ): string {
    if (!member) return "";

    const updateMember = member as UpdateMember;
    const regularMember = member as Member;

    const camelValue = updateMember[keyCamel];
    const snakeValue = regularMember[keySnake];

    return String(camelValue ?? snakeValue ?? "");
  }

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

      if (selectedSubgroup || selectedSection) {
        await dispatch(
          assignSubgroupAndSectionAction({
            memberId,
            subGroupId: selectedSubgroup ? Number(selectedSubgroup) : undefined,
            sectionId: selectedSection ? Number(selectedSection) : undefined,
          })
        ).unwrap();
      }

      const updates: Partial<UpdateMember> = {};

      if (selectedRole) {
        updates.role = selectedRole as UpdateMember["role"];
      }

      if (Object.keys(updates).length > 0) {
        if (updates.role) {
          const memberDto: Record<string, unknown> = {
            memberId: memberId,
            firstName: getMemberField("firstName", "first_name"),
            lastName: getMemberField("lastName", "last_name"),
            tenantId: getMemberField("tenantId", "tenant_id"),
            identification: getMemberField("identification", "identification"),
            documentType: getMemberField("documentType", "document_type"),
            status: "APPROVED",
            role: updates.role,
          };

          await dispatch(
            updateMemberByDtoAction({
              uid: String(memberId),
              memberDto,
            })
          ).unwrap();
        } else {
          await dispatch(
            updateMemberAction({
              uid: String(memberId),
              updates,
            })
          ).unwrap();
        }
      }

      const updateMemberData = member as UpdateMember;
      const regularMemberData = member as Member;

      const firstName =
        updateMemberData.firstName ?? regularMemberData.first_name ?? "";
      const lastName =
        updateMemberData.lastName ?? regularMemberData.last_name ?? "";

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
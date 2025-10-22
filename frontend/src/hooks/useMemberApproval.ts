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
  const canAccept = Boolean(memberId); // ahora no exige sección

  function getMemberField(keyCamel: string, keySnake: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = member as any;
    return m?.[keyCamel] ?? m?.[keySnake] ?? "";
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
        }),
      ).unwrap();

      // Call backend endpoint that assigns subgroup and section when available
      if (selectedSubgroup || selectedSection) {
        await dispatch(
          assignSubgroupAndSectionAction({
            memberId,
            subGroupId: selectedSubgroup ? Number(selectedSubgroup) : undefined,
            sectionId: selectedSection ? Number(selectedSection) : undefined,
          }),
        ).unwrap();
      }

      const updates: Partial<UpdateMember> = {};

      if (selectedRole) {
        // cast to UpdateMember.role union
        updates.role = selectedRole as UpdateMember["role"];
      }

      if (Object.keys(updates).length > 0) {
        // If updates only contains role, backend may still require other fields; build a minimal DTO
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
            }),
          ).unwrap();
        } else {
          await dispatch(
            updateMemberAction({
              uid: String(memberId),
              updates,
            }),
          ).unwrap();
        }
      }

      const firstName =
        (member as UpdateMember).firstName ??
        (member as Member).first_name ??
        "";
      const lastName =
        (member as UpdateMember).lastName ?? (member as Member).last_name ?? "";

      toast.success(
        `La solicitud de ${firstName} ${lastName} fue aprobada exitosamente.`,
      );

      onClose();
      onSuccess();
    } catch (e) {
      console.error("Error al aceptar solicitud:", e);
      toast.error(
        "Ocurrió un error al procesar la solicitud. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, canAccept, accept };
}

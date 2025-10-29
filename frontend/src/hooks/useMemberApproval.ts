import { useState } from "react";
import type { Member, UpdateMember } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import {
  updateMemberStatusAction,
  updateMemberAction,
  assignSubgroupAndSectionAction,
  updateMemberByDtoAction,
  changeAuth0UserRoleAction,
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
    keySnake: keyof Member,
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

      // 1) Aplicar asignaciones de subgrupo / sección primero (si aplica)
      if (selectedSubgroup || selectedSection) {
        await dispatch(
          assignSubgroupAndSectionAction({
            memberId,
            subGroupId: selectedSubgroup ? Number(selectedSubgroup) : undefined,
            sectionId: selectedSection ? Number(selectedSection) : undefined,
          }),
        ).unwrap();
      }

      // 2) Preparar actualizaciones (rol u otros)
      const updates: Partial<UpdateMember> = {};
      if (selectedRole) {
        updates.role = selectedRole as UpdateMember["role"];
      }

      if (Object.keys(updates).length > 0) {
        if (updates.role) {
          // Validación local para evitar errores por datos faltantes en backend
          const missing: string[] = [];
          const firstName = getMemberField("firstName", "first_name");
          const lastName = getMemberField("lastName", "last_name");
          const tenantId = getMemberField("tenantId", "tenant_id");
          const identification = getMemberField(
            "identification",
            "identification",
          );
          const documentType = getMemberField("documentType", "document_type");

          if (!firstName) missing.push("firstName");
          if (!lastName) missing.push("lastName");
          if (!tenantId) missing.push("tenantId");
          if (!identification) missing.push("identification");
          if (!documentType) missing.push("documentType");

          if (missing.length > 0) {
            toast.error(
              `No se puede asignar el rol: faltan campos requeridos (${missing.join(", ")}). Corrige los datos antes de aceptar.`,
            );
            setLoading(false);
            return;
          }

          const memberDto: Record<string, unknown> = {
            memberId: memberId,
            firstName,
            lastName,
            tenantId,
            identification,
            documentType,
            // status lo manejamos al final
            role: updates.role,
          };

          // Actualizar perfil en BD
          await dispatch(
            updateMemberByDtoAction({
              uid: String(memberId),
              memberDto,
            }),
          ).unwrap();

          // Intentar asignar el rol también en Auth0 si existe user_id
          try {
            const auth0UserId = getMemberField("userId", "user_id");
            if (auth0UserId) {
              await dispatch(
                changeAuth0UserRoleAction({
                  user_id: String(auth0UserId),
                  newRole: updates.role as string,
                }),
              ).unwrap();
            }
          } catch (err) {
            try {
              type ErrLike = {
                isAxiosError?: boolean;
                message?: string;
                response?: { status?: number; data?: unknown };
                error?: string;
              };

              const e = err as ErrLike;

              // Caso axios
              if (e?.isAxiosError) {
                console.error("Axios error changing role in Auth0:", {
                  message: e.message,
                  status: e.response?.status,
                  data: e.response?.data,
                });
                const data =
                  (e.response?.data as Record<string, unknown> | undefined) ??
                  undefined;
                const serverMsg =
                  (data && String(data["message"] || data["error"])) ||
                  undefined;
                toast.error(
                  `Error asignando rol en Auth0: ${serverMsg ?? e.message}`,
                );
              } else if (e && typeof e === "object") {
                // Caso createAsyncThunk rejectWithValue -> suele ser { error: string }
                console.error("Error changing role (rejected action):", e);
                const errMsg = e.error || e.message || JSON.stringify(e);
                toast.error(`Error asignando rol en Auth0: ${errMsg}`);
              } else {
                console.error("Error cambiando rol en Auth0:", err);
                toast.error("Error asignando rol en Auth0. Revisa los logs.");
              }
            } catch (logErr) {
              console.error(
                "Error procesando el error de cambio de rol:",
                logErr,
                err,
              );
              toast.error("Error asignando rol en Auth0. Revisa los logs.");
            }

            // Se aborta el flujo para no aprobar si no se sincroniza el rol
            throw err;
          }
        } else {
          // Actualizaciones que no son role
          await dispatch(
            updateMemberAction({
              uid: String(memberId),
              updates,
            }),
          ).unwrap();
        }
      }

      // Si todo lo anterior salio bien, finalmente marcamos como APPROVED
      await dispatch(
        updateMemberStatusAction({
          id: memberId,
          status: "APPROVED",
        }),
      ).unwrap();

      const updateMemberData = member as UpdateMember;
      const regularMemberData = member as Member;

      const firstName =
        updateMemberData.firstName ?? regularMemberData.first_name ?? "";
      const lastName =
        updateMemberData.lastName ?? regularMemberData.last_name ?? "";

      toast.success(
        `La solicitud de ${firstName} ${lastName} fue aprobada exitosamente.`,
      );

      onClose();
      onSuccess();
    } catch (e: unknown) {
      // Mejor logging de errores (axios)
      try {
        const errAny = e as {
          isAxiosError?: boolean;
          message?: string;
          response?:
            | { status?: number; data?: unknown; headers?: unknown }
            | undefined;
          config?: unknown;
        };
        if (errAny?.isAxiosError) {
          console.error("Axios error accepting request:", {
            message: errAny.message,
            status: errAny.response?.status,
            data: errAny.response?.data,
            headers: errAny.response?.headers,
            config: errAny.config,
          });
        } else {
          console.error("Error al aceptar solicitud:", e);
        }
      } catch (logErr) {
        console.error("Error logging exception in useMemberApproval:", logErr);
      }

      toast.error(
        "Ocurrió un error al procesar la solicitud. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, canAccept, accept };
}

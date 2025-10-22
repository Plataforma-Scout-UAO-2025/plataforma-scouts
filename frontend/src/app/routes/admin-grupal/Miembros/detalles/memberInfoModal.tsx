import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Member } from "@/types/member.type";
import PersonalInfo from "../../Solicitudes/detalles/components/PersonalInfo";
import EmergencyContacts from "../../Solicitudes/detalles/components/EmergencyContacts";
import Interests from "../../Solicitudes/detalles/components/Interests";
import MemberStatusBar from "../../Solicitudes/detalles/components/MemberStatusBar";
import MembersInChargeCard from "../../../guardians/profile/components/MembersInChargeCard";
import { useState, useEffect } from "react";
import { getMembersInChargeOf } from "@/api/guardiansApi";
import type { MemberBasicInfo } from "@/types/guardianTypes";

interface MemberInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

export default function MemberInfoModal({
  open,
  onOpenChange,
  member,
}: MemberInfoModalProps) {
  const [, setSelectedMemberId] = useState<number | null>(null);
  const [membersInCharge, setMembersInCharge] = useState<MemberBasicInfo[]>(
    []
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Determinar si es un Scout (tiene contactos de emergencia e intereses)
  const isScout = member?.role === "SCOUT";
  const isAcudiente = member?.role === "ACUDIENTE";

  // Obtener miembros a cargo cuando el modal se abre y es un acudiente
  useEffect(() => {
    const fetchMembersInCharge = async () => {
      if (!open || !isAcudiente || !member?.guardian_id) {
        setMembersInCharge([]);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const members = await getMembersInChargeOf(member.guardian_id);
        setMembersInCharge(members || []);
      } catch (error) {
        console.error("Error al obtener miembros a cargo:", error);
        setMembersInCharge([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembersInCharge();
  }, [open, isAcudiente, member?.guardian_id]);

  // Handler para ver detalles del miembro a cargo
  const handleViewMember = (id: number) => {
    setSelectedMemberId(id);
    // TODO: Implementar apertura de modal/sheet con detalles del miembro
    console.log("Ver detalles del miembro:", id);
  };

  // Convertir MemberBasicInfo a formato esperado por MembersInChargeCard
  const miembrosACargo = membersInCharge.map((m) => ({
    id: parseInt(m.userId || "0"),
    fullName: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
    rama: m.subgroup?.name || "Sin rama",
    parentesco: m.relationship || "No especificado",
    isActive: m.isActive ?? true,
  }));

  // Early return después de todos los hooks
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Información del Miembro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal - Común para todos los roles */}
          <PersonalInfo member={member} />

          {/* Estado del Miembro - Común para todos los roles */}
          <MemberStatusBar member={member} />

          {/* Contactos de Emergencia e Intereses - Solo para SCOUT */}
          {isScout && (
            <>
              <EmergencyContacts member={member} />
              <Interests member={member} />
            </>
          )}

          {/* Información específica de ACUDIENTE - Miembros a cargo */}
          {isAcudiente && (
            <>
              {isLoadingMembers ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Cargando miembros a cargo...</p>
                </div>
              ) : (
                <MembersInChargeCard
                  miembrosACargo={miembrosACargo}
                  grupo={member.subgroup?.name || "Sin grupo"}
                  role={member.role || "Acudiente"}
                  joinDate={member.created_at || member.acceptance_date || ""}
                  isActive={member.is_active ?? true}
                  onViewMember={handleViewMember}
                />
              )}
            </>
          )}

          {/* Placeholders para otros roles */}
          {member.role === "SCOUTER" && (
            <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
              <p className="text-sm text-purple-700">
                 Información específica de SCOUTER (próximamente)
              </p>
            </div>
          )}

          {member.role === "TESORERO" && (
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <p className="text-sm text-green-700">
                 Información específica de TESORERO (próximamente)
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
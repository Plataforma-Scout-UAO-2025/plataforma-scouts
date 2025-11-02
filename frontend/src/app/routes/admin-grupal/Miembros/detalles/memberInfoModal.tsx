import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Member } from "@/types/member.type";
import { Button } from "@/components/ui/button";
import PersonalInfo from "../../Solicitudes/detalles/components/PersonalInfo";
import EmergencyContacts from "../../Solicitudes/detalles/components/EmergencyContacts";
import Interests from "../../Solicitudes/detalles/components/Interests";
import MemberStatusBar from "../../Solicitudes/detalles/components/MemberStatusBar";
import SchoolInfo from "../../Solicitudes/detalles/components/SchoolInfo";
import MembersInChargeCard from "../../../guardians/profile/components/MembersInChargeCard";
import { useState, useEffect } from "react";
import { getMembersInChargeOf, getGuardianById } from "@/api/guardiansApi";
import { getMembersWithBranch, getMembersByStatus } from "@/api/membersApi";

import MemberAssignmentInfo from "@/app/routes/admin-grupal/Miembros/components/MemberAssignmentInfo";
import GuardianInfo from "@/app/routes/admin-grupal/Miembros/components/GuardianInfo";
import type { MemberBasicInfo } from "@/types/guardian.type";

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
  const [membersInCharge, setMembersInCharge] = useState<MemberBasicInfo[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [fullMemberData, setFullMemberData] = useState<Member | null>(null);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);
  const [guardianInfo, setGuardianInfo] = useState<any>(null);
  const [loadingGuardian, setLoadingGuardian] = useState(false);

  const isScout = member?.role?.toUpperCase() === "SCOUT";
  const isAcudiente = member?.role?.toUpperCase() === "ACUDIENTE";

  const handleClose = () => onOpenChange(false);

  //Cargar datos completos del miembro
  useEffect(() => {
    const fetchCombinedData = async () => {
      if (!open) {
        setFullMemberData(null);
        setGuardianInfo(null);
        return;
      }

      const targetMemberId = member?.member_id ?? member?.memberId;
      if (!targetMemberId) return;

      setIsLoadingFullData(true);
      try {
        const [membersWithBranch, membersWithStatus] = await Promise.all([
          getMembersWithBranch(),
          getMembersByStatus("APPROVED"),
        ]);

        const fromBranch = membersWithBranch.find(
          (m: Member) =>
            String(m.member_id ?? m.memberId) === String(targetMemberId)
        );
        const fromStatus = membersWithStatus.find(
          (m: Member) =>
            String(m.member_id ?? m.memberId) === String(targetMemberId)
        );

        const merged = { ...fromBranch, ...fromStatus };
        setFullMemberData(merged || null);

        // Obtener información del acudiente si el miembro es SCOUT
        if (merged?.guardian_id) {
          setLoadingGuardian(true);
          const guardian = await getGuardianById(merged.guardian_id);
          setGuardianInfo(guardian);
          setLoadingGuardian(false);
        } else {
          setGuardianInfo(null);
        }
      } catch (error) {
        console.error("Error al obtener datos del miembro o acudiente:", error);
        setFullMemberData(null);
        setGuardianInfo(null);
        setLoadingGuardian(false);
      } finally {
        setIsLoadingFullData(false);
      }
    };

    fetchCombinedData();
  }, [open, member?.member_id, member?.memberId]);

  // Cargar miembros a cargo si es acudiente
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

  const handleViewMember = (id: number) => setSelectedMemberId(id);

  const miembrosACargo = membersInCharge.map((m) => ({
    id: parseInt(m.memberId || "0"),
    fullName: `${m.first_name || ""} ${m.last_name || ""}`.trim(),
    rama: m.subgroup?.name || "Sin rama",
    parentesco: m.relationship || "No especificado",
    isActive: m.is_active ?? true,
  }));

  if (!member) return null;

  const displayMember = fullMemberData || member;
  const memberId = displayMember.member_id ?? displayMember.memberId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Información del Miembro
          </DialogTitle>
          <DialogDescription>
            Visualiza toda la información detallada del miembro seleccionado.
          </DialogDescription>
        </DialogHeader>

        {isLoadingFullData ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Cargando información completa...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <PersonalInfo member={displayMember} />

            {isScout && memberId && <SchoolInfo memberId={memberId} />}
            {isScout && (
              <>
                <EmergencyContacts member={displayMember} />
                <Interests member={displayMember} />
              </>
            )}

            

            {isScout && (
              <GuardianInfo guardian={guardianInfo} loading={loadingGuardian} />
            )}
            <MemberAssignmentInfo member={displayMember} />
            <MemberStatusBar member={displayMember} />

            {isAcudiente && (
              <>
                {isLoadingMembers ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Cargando miembros a cargo...</p>
                  </div>
                ) : (
                  <MembersInChargeCard
                    miembrosACargo={miembrosACargo}
                    onViewMember={handleViewMember}
                  />
                )}
              </>
            )}
            {displayMember.role === "SCOUTER" && (
              <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                <p className="text-sm text-purple-700">
                  Información específica de SCOUTER (próximamente)
                </p>
              </div>
            )}
            {displayMember.role === "TESORERO" && (
              <div className="p-4 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm text-green-700">
                  Información específica de TESORERO (próximamente)
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="primary" onClick={handleClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
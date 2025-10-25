import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Member } from "@/types/member.type";
import PersonalInfo from "./components/PersonalInfo";
import EmergencyContacts from "./components/EmergencyContacts";
import Interests from "./components/Interests";
import AssignmentSelectors from "./components/AssignmentSelectors";
import SchoolInfo from "./components/SchoolInfo";
import MemberStatusBar from "./components/MemberStatusBar";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { useMemberApproval } from "@/hooks/useMemberApproval";
import { listRoles } from "@/api/membersApi";
import type { RoleSummary } from "@/api/membersApi";
import { useState, useEffect } from "react";

interface MemberDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  orgId: string;
  onSuccess: () => void;
  onReject: () => void;
}

export default function MemberDetailsModal({
  open,
  onOpenChange,
  member,
  orgId,
  onSuccess,
  onReject,
}: MemberDetailsModalProps) {
  const {
    groups,
    sections,
    subgroups,
    selectedGroupSlug,
    setSelectedGroupSlug,
    selectedSection,
    setSelectedSection,
    selectedSubgroup,
    setSelectedSubgroup,
    resetSelections,
  } = useOrgStructure({ orgId, open });

  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleClose = () => {
    resetSelections();
    setSelectedRole("");
    onOpenChange(false);
  };

  // Cargar roles al abrir el modal
  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      if (!open) return;
      setRolesLoading(true);
      setRolesError(null);
      try {
        const data = await listRoles();
        if (mounted) setRoles(data);
      } catch {
        if (mounted) setRolesError("No fue posible cargar los roles");
      } finally {
        if (mounted) setRolesLoading(false);
      }
    };

    fetchRoles();
    return () => {
      mounted = false;
    };
  }, [open]);

  const { loading, canAccept, accept } = useMemberApproval({
    member,
    selectedSection,
    selectedSubgroup,
    selectedRole,
    onSuccess,
    onClose: handleClose,
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Detalles de la solicitud
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando información...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <PersonalInfo member={member} />
            <EmergencyContacts member={member} />
            <Interests member={member} />

            <SchoolInfo memberId={member.member_id} />

            <AssignmentSelectors
              groups={groups}
              sections={sections}
              subgroups={subgroups}
              selectedGroupSlug={selectedGroupSlug}
              setSelectedGroupSlug={setSelectedGroupSlug}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              selectedSubgroup={selectedSubgroup}
              setSelectedSubgroup={setSelectedSubgroup}
              roles={roles}
              rolesLoading={rolesLoading}
              rolesError={rolesError}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />

            <MemberStatusBar member={member} />
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-2 mt-6 border-t pt-4">
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={loading}
            className="flex-1"
          >
            Rechazar Solicitud
          </Button>
          <Button
            variant="primary"
            onClick={accept}
            disabled={
              loading || !canAccept || !selectedGroupSlug || !selectedRole
            }
            className="flex-1 bg-green-900 hover:bg-green/800"
          >
            {loading ? "Procesando..." : "Aceptar Solicitud"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

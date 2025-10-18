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
import MemberStatusBar from "./components/MemberStatusBar";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { useMemberApproval } from "@/hooks/useMemberApproval";
import { listRoles } from "@/api/membersApi";
import type { RoleSummary } from "@/api/membersApi";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleClose = () => {
    resetSelections();
    setSelectedRole("");
    onOpenChange(false);
  };
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { loading, canAccept, accept } = useMemberApproval({
    member,
    selectedSection,
    selectedSubgroup,
    selectedRole,
    onSuccess,
    onClose: handleClose,
  });

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
  }, [open, setRoles, setRolesLoading, setRolesError]);

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
            />
            <div className="pt-4">
              <h3 className="text-lg font-medium">Rol</h3>
              {rolesError ? (
                <p className="text-destructive">{rolesError}</p>
              ) : (
                <div className="w-full">
                  <Label htmlFor="role">Selecciona un rol *</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(val) => setSelectedRole(val)}
                    disabled={rolesLoading || roles.length === 0}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue
                        placeholder={
                          rolesLoading
                            ? "Cargando roles..."
                            : roles.length === 0
                              ? "No hay roles disponibles"
                              : "Selecciona un rol"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length > 0 ? (
                        roles.map((r) => (
                          <SelectItem key={r.id} value={r.name.toUpperCase()}>
                            {r.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-roles" disabled>
                          {rolesLoading
                            ? "Cargando..."
                            : "Sin roles disponibles"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedRole && (
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        roles.find((x) => x.name.toUpperCase() === selectedRole)
                          ?.description
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
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
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Procesando..." : "Aceptar Solicitud"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

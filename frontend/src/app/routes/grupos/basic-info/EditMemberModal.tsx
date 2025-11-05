import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Member } from "@/types/member.type";
import { useMemberEdit } from "@/hooks/useMemberEdit";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { getMembersByStatus } from "@/api/membersApi";
import AssignmentSection from "./components/edit/AssignmentSection";
import PersonalInfoForm from "../basic-info/components/edit/PersonalInfoForm";
import PhysicalInfoForm from "../basic-info/components/edit/PhysicalInfoForm";
import EmergencyContactsForm from "../basic-info/components/edit/EmergencyContactsForm";
import RoleSelectionForm from "../basic-info/components/edit/RoleSelectionForm";
import type { role } from "@/types/enrollment.type";

interface EditMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess?: () => void;
}

export default function EditMemberModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditMemberModalProps) {
  const orgId = String(member?.tenant_id || member?.tenantId || "");
  const [loadingDetails, setLoadingDetails] = useState(false);

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
  } = useOrgStructure({ orgId, open });

  const {
    loading,
    editedData,
    handleFieldChange,
    handleSave,
    handleCancel,
    initEdit,
  } = useMemberEdit({
    member,
    selectedSection,
    selectedSubgroup,
    onSuccess: () => {
      onSuccess?.();
    },
    onClose: () => onOpenChange(false),
    onRefresh: onSuccess,
  });

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!open || !member) return;
      setLoadingDetails(true);
      try {
        const allMembers = await getMembersByStatus("APPROVED");
        const fullData = allMembers.find(
          (m) =>
            String(m.member_id ?? m.memberId) ===
            String(member.member_id ?? member.memberId)
        );
        if (fullData) {
          initEdit(fullData);
        } else {
          initEdit(member);
        }
      } catch (error) {
        console.error("Error al cargar contactos de emergencia:", error);
        initEdit();
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchMemberDetails();
  }, [open, member, initEdit]);

  useEffect(() => {
    if (groups.length === 1 && !selectedGroupSlug) {
      setSelectedGroupSlug(groups[0].groupSlug);
    }
  }, [groups, selectedGroupSlug, setSelectedGroupSlug]);

  useEffect(() => {
    if (open && member && selectedGroupSlug && sections.length > 0 && !selectedSection) {
      if (member.subgroup?.section?.sectionId) {
        setSelectedSection(String(member.subgroup.section.sectionId));
      }
    }
  }, [open, member, selectedGroupSlug, sections, selectedSection, setSelectedSection]);

  useEffect(() => {
    if (open && member && selectedSection && subgroups.length > 0 && !selectedSubgroup) {
      if (member.subgroup?.subgroupId) {
        const subgroupExists = subgroups.some(sg => sg.id === member.subgroup?.subgroupId);
        if (subgroupExists) {
          setSelectedSubgroup(String(member.subgroup.subgroupId));
        }
      }
    }
  }, [open, member, selectedSection, subgroups, selectedSubgroup, setSelectedSubgroup]);

  useEffect(() => {
    if (!open) {
      setSelectedSection("");
      setSelectedSubgroup("");
      setSelectedGroupSlug("");
    }
  }, [open, setSelectedSection, setSelectedSubgroup, setSelectedGroupSlug]);

  if (!member) return null;

  const emergencyContacts = (editedData.emergencyContacts || []) as import("@/types/member.type").EmergencyContact[];

  const isAssignmentValid = () => {
    if (!selectedSection) return true;

    if (selectedSection && subgroups.length === 0) return true;

    if (selectedSection && subgroups.length > 0 && !selectedSubgroup) return false;

    return true;
  };

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    const updated = emergencyContacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    handleFieldChange("emergencyContacts", updated as import("@/types/member.type").EmergencyContact[]);
  };

  const handleAddEmergencyContact = () => {
    const updated = [...emergencyContacts, { name: "", relationship: "", phone: "" }];
    handleFieldChange("emergencyContacts", updated as import("@/types/member.type").EmergencyContact[]);
  };

  const handleRemoveEmergencyContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    handleFieldChange("emergencyContacts", updated as import("@/types/member.type").EmergencyContact[]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Información del Miembro 
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del miembro <span className=" text-l text-primary/800">
              <strong>{member?.firstName ?? member?.first_name}{" "}
                {member?.lastName ?? member?.last_name}</strong>
            </span> y guarda los cambios. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        {loadingDetails ? (
          <div className="py-6 text-center text-gray-500">
            Cargando datos del miembro...
          </div>
        ) : (
          <div className="space-y-6">
            <PersonalInfoForm
              editedData={editedData}
              loading={loading}
              onFieldChange={handleFieldChange}
            />

            <PhysicalInfoForm
              editedData={editedData}
              loading={loading}
              onFieldChange={handleFieldChange}
            />

            <EmergencyContactsForm
              emergencyContacts={emergencyContacts}
              loading={loading}
              onContactChange={handleEmergencyContactChange}
              onAddContact={handleAddEmergencyContact}
              onRemoveContact={handleRemoveEmergencyContact}
            />

            <RoleSelectionForm
              currentRole={editedData.role as role}
              onRoleChange={(newRole) => handleFieldChange("role", newRole)}
              loading={loading}
            />

            <RoleSelectionForm
              currentRole={editedData.role as role}
              onRoleChange={(newRole) => handleFieldChange("role", newRole)}
              loading={loading}
            />

            <AssignmentSection
              groups={groups}
              sections={sections}
              subgroups={subgroups}
              selectedGroupSlug={selectedGroupSlug}
              setSelectedGroupSlug={setSelectedGroupSlug}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              selectedSubgroup={selectedSubgroup}
              setSelectedSubgroup={setSelectedSubgroup}
              loading={loading}
              currentAssignment={{
                sectionName: member?.subgroup?.section?.name,
                subgroupName: member?.subgroup?.name,
              }}
            />
          </div>
        )}

        <DialogFooter>
          {selectedSection && subgroups.length > 0 && !selectedSubgroup && (
            <p className="text-sm text-red-600 mr-auto">
              Por favor selecciona una subrama antes de guardar
            </p>
          )}
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !isAssignmentValid()}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
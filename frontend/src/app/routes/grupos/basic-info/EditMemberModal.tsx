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
import { getMembersByStatus } from "@/api/membersApi";
import { useMemberEdit } from "@/hooks/useMemberEdit";
import PersonalInfoForm from "../basic-info/components/edit/PersonalInfoForm";
import PhysicalInfoForm from "../basic-info/components/edit/PhysicalInfoForm";
import EmergencyContactsForm from "../basic-info/components/edit/EmergencyContactsForm";

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
  const [loadingDetails, setLoadingDetails] = useState(false);

  const {
    loading,
    editedData,
    handleFieldChange,
    handleSave,
    handleCancel,
    initEdit,
  } = useMemberEdit({
    member,
    onSuccess: () => {
      onSuccess?.();
    },
    onClose: () => onOpenChange(false),
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

  if (!member) return null;

  const isScout = member?.role?.toUpperCase() === "SCOUT";
  const emergencyContacts =
    (editedData.emergencyContacts || []) as import("@/types/member.type").EmergencyContact[];

  const handleEmergencyContactChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = emergencyContacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    handleFieldChange("emergencyContacts", updated);
  };

  const handleAddEmergencyContact = () => {
    const updated = [
      ...emergencyContacts,
      { name: "", relationship: "", phone: "" },
    ];
    handleFieldChange("emergencyContacts", updated);
  };

  const handleRemoveEmergencyContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    handleFieldChange("emergencyContacts", updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Información del Miembro
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del miembro y guarda los cambios. Los campos
            marcados con * son obligatorios.
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

            {isScout && (
              <EmergencyContactsForm
                emergencyContacts={emergencyContacts}
                loading={loading}
                onContactChange={handleEmergencyContactChange}
                onAddContact={handleAddEmergencyContact}
                onRemoveContact={handleRemoveEmergencyContact}
              />
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
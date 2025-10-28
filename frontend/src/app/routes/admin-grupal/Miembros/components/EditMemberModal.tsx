import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Member } from "@/types/member.type";
import { useMemberEdit } from "@/hooks/useMemberEdit";

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
    if (open && member) {
      initEdit();
    }
  }, [open, member, initEdit]);

  if (!member) return null;

  const isScout = member?.role?.toUpperCase() === "SCOUT";
  const emergencyContacts = (editedData.emergencyContacts || []) as import("@/types/member.type").EmergencyContact[];

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
            Modifica los datos del miembro y guarda los cambios. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={editedData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Ingrese el número de contacto"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={editedData.address || ""}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="Ingrese la dirección"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={editedData.firstName || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={editedData.lastName || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identification">Identificación</Label>
                <Input
                  id="identification"
                  value={editedData.identification || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Información Física */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
              Información Física
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={editedData.weight || ""}
                  onChange={(e) => handleFieldChange("weight", e.target.value)}
                  placeholder="Ej: 60"
                  disabled={loading}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={editedData.height || ""}
                  onChange={(e) => handleFieldChange("height", e.target.value)}
                  placeholder="Ej: 170"
                  disabled={loading}
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          {/* Contactos de emergencia solo para SCOUT */}
          {isScout && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
                Contactos de Emergencia
              </h3>
              {emergencyContacts.length === 0 && (
                <p className="text-gray-500">No hay contactos de emergencia agregados.</p>
              )}
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-2 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input
                      value={contact.name}
                      onChange={e => handleEmergencyContactChange(idx, "name", e.target.value)}
                      placeholder="Nombre del contacto"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relación *</Label>
                    <Input
                      value={contact.relationship}
                      onChange={e => handleEmergencyContactChange(idx, "relationship", e.target.value)}
                      placeholder="Ej: Madre, Padre, Tío"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono *</Label>
                    <Input
                      value={contact.phone}
                      onChange={e => handleEmergencyContactChange(idx, "phone", e.target.value)}
                      placeholder="Teléfono de emergencia"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveEmergencyContact(idx)}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddEmergencyContact}
                disabled={loading}
              >
                Agregar contacto
              </Button>
            </div>
          )}
        </div>
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
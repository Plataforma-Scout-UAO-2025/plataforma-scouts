import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmergencyContact } from "@/types/member.type";

interface EmergencyContactsFormProps {
  emergencyContacts: EmergencyContact[];
  loading: boolean;
  onContactChange: (index: number, field: string, value: string) => void;
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
}

export default function EmergencyContactsForm({
  emergencyContacts,
  loading,
  onContactChange,
  onAddContact,
  onRemoveContact,
}: EmergencyContactsFormProps) {
  const isLastContactComplete = () => {
    if (emergencyContacts.length === 0) return true;

    const lastContact = emergencyContacts[emergencyContacts.length - 1];
    return (
      lastContact.name?.trim() !== "" &&
      lastContact.relationship?.trim() !== "" &&
      lastContact.phone?.trim() !== ""
    );
  };

  const canAddNewContact = isLastContactComplete();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
        Contactos de Emergencia
      </h3>

      {emergencyContacts.length === 0 ? (
        <p className="text-gray-500 mb-4">
          No hay contactos de emergencia agregados.
        </p>
      ) : (
        emergencyContacts.map((contact, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-gray-50"
          >
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={contact.name}
                onChange={(e) => onContactChange(idx, "name", e.target.value)}
                placeholder="Nombre del contacto"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Relación *</Label>
              <Input
                value={contact.relationship}
                onChange={(e) => onContactChange(idx, "relationship", e.target.value)}
                placeholder="Ej: Madre, Padre, Tío"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input
                value={contact.phone}
                onChange={(e) => onContactChange(idx, "phone", e.target.value)}
                placeholder="Teléfono de emergencia"
                disabled={loading}
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveContact(idx)}
                disabled={loading}
              >
                Eliminar Contacto
              </Button>

              {idx === emergencyContacts.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddContact}
                  disabled={loading || !canAddNewContact}
                  title={
                    !canAddNewContact
                      ? "Completa todos los campos del contacto actual antes de agregar uno nuevo"
                      : "Agregar nuevo contacto de emergencia"
                  }
                >
                  + Agregar Contacto
                </Button>
              )}
            </div>
          </div>
        ))
      )}

      {emergencyContacts.length === 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddContact}
          disabled={loading}
          className="w-full"
        >
          + Agregar Primer Contacto
        </Button>
      )}

      {!canAddNewContact && emergencyContacts.length > 0 && (
        <p className="text-xs text-red-600">
          Complete todos los campos del contacto actual antes de agregar uno nuevo
        </p>
      )}
    </div>
  );
}
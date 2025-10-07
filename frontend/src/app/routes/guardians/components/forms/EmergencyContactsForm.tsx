import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactsFormProps {
  emergencyContacts: EmergencyContact[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof EmergencyContact, value: string) => void;
}

export default function EmergencyContactsForm({
  emergencyContacts,
  onAdd,
  onRemove,
  onUpdate
}: EmergencyContactsFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1a4134]">Contactos de Emergencia *</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={emergencyContacts.length >= 3}
          className="text-[#1a4134]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Contacto
        </Button>
      </div>

      <div className="space-y-4">
        {emergencyContacts.map((contact, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">Contacto #{index + 1}</h4>
              {emergencyContacts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Nombre */}
              <div>
                <Label htmlFor={`contact-name-${index}`}>Nombre *</Label>
                <Input
                  id={`contact-name-${index}`}
                  value={contact.name}
                  onChange={(e) => onUpdate(index, 'name', e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>

              {/* Relación */}
              <div>
                <Label htmlFor={`contact-relationship-${index}`}>Relación *</Label>
                <Input
                  id={`contact-relationship-${index}`}
                  value={contact.relationship}
                  onChange={(e) => onUpdate(index, 'relationship', e.target.value)}
                  placeholder="Ej: Madre, Padre"
                />
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor={`contact-phone-${index}`}>Teléfono *</Label>
                <Input
                  id={`contact-phone-${index}`}
                  value={contact.phone}
                  onChange={(e) => onUpdate(index, 'phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        * Debes agregar al menos un contacto de emergencia completo
      </p>
    </div>
  );
}

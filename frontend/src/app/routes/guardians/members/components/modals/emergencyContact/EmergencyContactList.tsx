import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EmergencyContactItem from './EmergencyContactItem';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactsListProps {
  contacts: EmergencyContact[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof EmergencyContact, value: string) => void;
  onRemove: (index: number) => void;
}

export default function EmergencyContactsList({
  contacts = [],
  onAdd,
  onUpdate,
  onRemove
}: EmergencyContactsListProps) {
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  return (
    <div className="space-y-4 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-[#1a4134]">Contactos de Emergencia</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="text-[#1a4134]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Contacto
        </Button>
      </div>

      {safeContacts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay contactos de emergencia. Haz clic en "Agregar Contacto" para añadir uno.
        </p>
      ) : (
        safeContacts.map((contact, index) => (
          <EmergencyContactItem
            key={`contact-${index}`}
            contact={contact}
            index={index}
            canRemove={safeContacts.length > 1}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
}
import { Phone, User } from 'lucide-react';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactsSectionProps {
  contacts: EmergencyContact[];
}

export default function EmergencyContactsSection({ contacts = [] }: EmergencyContactsSectionProps) {
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  return (
    <div className="p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Phone className="h-5 w-5" />
        Contactos de Emergencia
      </h3>

      {safeContacts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay contactos de emergencia registrados
        </p>
      ) : (
        <div className="space-y-4">
          {safeContacts.map((contact, index) => (
            <div key={`contact-${index}`} className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-sm text-gray-700 mb-3">
                Contacto {index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {contact.name || "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Parentesco</p>
                  <p className="font-medium text-gray-900">
                    {contact.relationship || "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {contact.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
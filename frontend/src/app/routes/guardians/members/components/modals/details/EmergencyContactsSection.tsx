import type { MemberBasicInfo } from "@/types/guardian.type";

interface EmergencyContactsSectionProps {
  member: MemberBasicInfo;
}

export default function EmergencyContactsSection({ member }: EmergencyContactsSectionProps) {
  // Solo renderizar si hay contactos de emergencia
  if (!member.emergencyContacts || member.emergencyContacts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Contactos de Emergencia
      </h3>
      <div className="space-y-4">
        {member.emergencyContacts.map((contact, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{contact.name || "No especificado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-gray-900">{contact.phone || "No especificado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Parentesco</label>
                <p className="text-gray-900">{contact.relationship || "No especificado"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
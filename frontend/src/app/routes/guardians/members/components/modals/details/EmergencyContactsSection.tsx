import type { MemberBasicInfo } from "@/types/guardian.type";

interface EmergencyContactsSectionProps {
  member: MemberBasicInfo;
}

export default function EmergencyContactsSection({ member }: EmergencyContactsSectionProps) {
  
  const emergencyContacts = member.emergencyContacts || [];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
       Contactos de Emergencia
      </h3>
      
      {emergencyContacts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📞</div>
          <p className="text-gray-500 italic text-lg">No hay contactos de emergencia registrados</p>
          <p className="text-gray-400 text-sm mt-2">Se recomienda agregar al menos un contacto</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👤</span>
                <h4 className="font-medium text-gray-900">Contacto {index + 1}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900 font-medium">
                    {contact.name || "No especificado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                    📱 {contact.phone || "No especificado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parentesco</label>
                  <p className="text-gray-900">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {contact.relationship || "No especificado"}
                    </span>
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
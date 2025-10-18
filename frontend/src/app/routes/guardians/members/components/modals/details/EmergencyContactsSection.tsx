import { Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Member } from '../../../types/member.type';

interface EmergencyContactsSectionProps {
  miembro: Member;
}

export default function EmergencyContactsSection({ miembro }: EmergencyContactsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Phone className="h-5 w-5 text-[#1a4134]" />
        <h4 className="text-lg font-semibold text-[#1a4134]">Contactos de Emergencia</h4>
      </div>
      <div className="space-y-3 pl-7">
        {miembro.emergencyContacts && miembro.emergencyContacts.length > 0 ? (
          miembro.emergencyContacts.map((contacto, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nombre</p>
                    <p className="text-base font-medium">{contacto.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Relación</p>
                    <p className="text-base">{contacto.relationship}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    <p className="text-base">{contacto.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-base text-gray-500">No hay contactos de emergencia registrados</p>
        )}
      </div>
    </div>
  );
}

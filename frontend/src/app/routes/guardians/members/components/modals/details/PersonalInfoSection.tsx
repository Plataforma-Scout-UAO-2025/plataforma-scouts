import { User } from 'lucide-react';
import type { Member } from '../../../types/member.type';

interface PersonalInfoSectionProps {
  miembro: Member;
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
const calcularEdad = (fechaNacimiento: string): number => {
  const today = new Date();
  const birthDate = new Date(fechaNacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Formatea el género a texto legible
 */
const formatGender = (gender: 'MALE' | 'FEMALE' | 'OTHER'): string => {
  switch (gender) {
    case 'MALE':
      return 'Masculino';
    case 'FEMALE':
      return 'Femenino';
    case 'OTHER':
      return 'Otro';
    default:
      return 'No especificado';
  }
};

export default function PersonalInfoSection({ miembro }: PersonalInfoSectionProps) {
  const edad = calcularEdad(miembro.birthDate);

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-[#1a4134]" />
        <h4 className="text-lg font-semibold text-[#1a4134]">Información Personal</h4>
      </div>
      <div className="grid grid-cols-2 gap-4 pl-7">
        <div>
          <p className="text-sm font-medium text-gray-600">Edad</p>
          <p className="text-base">{edad} años</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Rol</p>
          <p className="text-base">{miembro.role || 'Scout Aspirante'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Identificación</p>
          <p className="text-base font-mono">{miembro.documentType} {miembro.identification}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Email</p>
          <p className="text-base">{miembro.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Género</p>
          <p className="text-base">{formatGender(miembro.gender)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Fecha de Nacimiento</p>
          <p className="text-base">
            {new Date(miembro.birthDate).toLocaleDateString('es-CO')}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-600">Teléfono</p>
          <p className="text-base">{miembro.phone}</p>
        </div>
      </div>
    </div>
  );
}

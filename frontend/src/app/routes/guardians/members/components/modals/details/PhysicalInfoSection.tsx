import { Activity } from 'lucide-react';
import type { Member } from '../../../types/member.type';

interface PhysicalInfoSectionProps {
  miembro: Member;
}

export default function PhysicalInfoSection({ miembro }: PhysicalInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Activity className="h-5 w-5 text-[#1a4134]" />
        <h4 className="text-lg font-semibold text-[#1a4134]">Información Física</h4>
      </div>
      <div className="grid grid-cols-2 gap-4 pl-7">
        <div>
          <p className="text-sm font-medium text-gray-600">Peso</p>
          <p className="text-base">{miembro.weight || 'No especificado'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Altura</p>
          <p className="text-base">{miembro.height || 'No especificado'}</p>
        </div>
      </div>
    </div>
  );
}

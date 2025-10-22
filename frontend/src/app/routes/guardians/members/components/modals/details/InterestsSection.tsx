import { Heart } from 'lucide-react';
import type { Member } from '../../../types/member.type';

interface InterestsSectionProps {
  miembro: Member;
}

export default function InterestsSection({ miembro }: InterestsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Heart className="h-5 w-5 text-[#1a4134]" />
        <h4 className="text-lg font-semibold text-[#1a4134]">Intereses y Habilidades</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 pl-7">
        <div>
          <p className="text-sm font-medium text-gray-600">Hobbies</p>
          <p className="text-base">{miembro.hobbies || 'No especificado'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Deportes</p>
          <p className="text-base">{miembro.sports || 'No especificado'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Instrumentos</p>
          <p className="text-base">{miembro.instruments || 'No especificado'}</p>
        </div>
      </div>
    </div>
  );
}

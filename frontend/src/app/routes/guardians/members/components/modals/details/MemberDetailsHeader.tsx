import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Member } from '../../../types/member.type';

interface MemberDetailsHeaderProps {
  miembro: Member;
}

export default function MemberDetailsHeader({ miembro }: MemberDetailsHeaderProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="h-16 w-16 rounded-full bg-[#1a4134] flex items-center justify-center">
        <User className="h-8 w-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[#1a4134]">
          {miembro.firstName} {miembro.lastName}
        </h3>
        <Badge 
          variant={miembro.isActive ? 'default' : 'secondary'}
          className={miembro.isActive ? 'bg-green-100 text-green-800' : ''}
        >
          {miembro.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>
    </div>
  );
}

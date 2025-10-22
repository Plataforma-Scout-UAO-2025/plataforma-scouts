import { MapPin } from 'lucide-react';
import type { Member } from '../../../types/member.type';

interface AddressSectionProps {
  miembro: Member;
}

export default function AddressSection({ miembro }: AddressSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-[#1a4134]" />
        <h4 className="text-lg font-semibold text-[#1a4134]">Dirección</h4>
      </div>
      <div className="pl-7">
        <p className="text-base">{miembro.address}</p>
      </div>
    </div>
  );
}

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Member } from '../../types/member.type';
import MemberDetailsHeader from './details/MemberDetailsHeader';
import PersonalInfoSection from './details/PersonalInfoSection';
import PhysicalInfoSection from './details/PhysicalInfoSection';
import InterestsSection from './details/InterestsSection';
import AddressSection from './details/AddressSection';
import EmergencyContactsSection from './details/EmergencyContactsSection';

interface MiembroDetallesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: Member | null;
  onEdit: (miembro: Member) => void;
}

export default function MiembroDetallesSheet({
  isOpen,
  onClose,
  miembro,
  onEdit,
}: MiembroDetallesSheetProps) {
  if (!miembro) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 px-6">
          <div>
            <SheetTitle className="text-2xl font-bold text-[#1a4134]">
              Detalles del Integrante
            </SheetTitle>
            <SheetDescription className="text-base">
              Información completa del miembro de la tropa
            </SheetDescription>
          </div>
          
          <MemberDetailsHeader miembro={miembro} />
        </SheetHeader>

        <div className="space-y-6 pb-6 px-6">
          <PersonalInfoSection miembro={miembro} />
          
          <Separator />
          
          <PhysicalInfoSection miembro={miembro} />
          
          <Separator />
          
          <InterestsSection miembro={miembro} />
          
          <Separator />
          
          <AddressSection miembro={miembro} />
          
          <Separator />
          
          <EmergencyContactsSection miembro={miembro} />
        </div>

        <SheetFooter className="space-x-2 pt-6 border-t px-6">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
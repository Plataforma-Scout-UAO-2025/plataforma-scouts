import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { MemberBasicInfo } from "@/types/guardian.type";
import PersonalInfoSection from "./details/PersonalInfoSection";
import EmergencyContactsSection from "./details/EmergencyContactsSection";
import ScoutInfoSection from "./details/ScoutInfoSection";

interface MemberDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberBasicInfo | null;
}

export default function MemberDetailsSheet({
  open,
  onOpenChange,
  member,
}: MemberDetailsSheetProps) {
  if (!member) return null;



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Detalles del Miembro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <PersonalInfoSection member={member} />
          <EmergencyContactsSection member={member} />
          <ScoutInfoSection member={member} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
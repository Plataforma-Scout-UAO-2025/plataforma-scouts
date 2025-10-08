import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface Props {
  open: boolean;
  message?: string;
  onClose: () => void;
}

export default function SuccessModal({ open, message = "Se guardó con éxito", onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs bg-emerald-900 text-white text-center flex flex-col items-center py-8">
        <p className="text-lg font-semibold mb-3">{message}</p>
        <Check className="h-8 w-8" />
      </DialogContent>
    </Dialog>
  );
}

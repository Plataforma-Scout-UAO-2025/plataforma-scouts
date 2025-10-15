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
      <DialogContent className="max-w-xs rounded-xl bg-primary text-white text-center flex flex-col items-center justify-center py-10 shadow-md">
        <p className="text-lg font-semibold mb-3">{message}</p>
        <Check className="h-10 w-10 text-white" />
      </DialogContent>
    </Dialog>
  );
}

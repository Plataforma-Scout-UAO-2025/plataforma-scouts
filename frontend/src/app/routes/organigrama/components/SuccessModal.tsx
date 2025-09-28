import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ open, message, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm w-full rounded-xl bg-primary text-primary-foreground p-6 shadow-xl">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md border border-primary-foreground/50">
            <Check className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-semibold">Operación exitosa</DialogTitle>
          <DialogDescription className="text-sm">{message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}



import * as Dialog from '@radix-ui/react-dialog';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ open, message, onClose }: SuccessModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Fondo oscurecido */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

        {/* Contenedor del modal */}
        <Dialog.Content className="
          fixed left-1/2 top-1/2 z-50 w-full max-w-sm
          -translate-x-1/2 -translate-y-1/2
          rounded-xl bg-primary text-primary-foreground
          p-6 shadow-xl ring-1 ring-primary-foreground/20
        ">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Marco del icono para mantener consistencia visual */}
            <div className="grid h-12 w-12 place-items-center rounded-md border border-primary-foreground/50">
              <Check className="h-6 w-6" />
            </div>

            <p className="text-lg font-semibold">{message}</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



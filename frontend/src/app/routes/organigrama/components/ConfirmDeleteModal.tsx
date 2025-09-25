import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Mensaje */}
          <p className="text-sm text-foreground mb-4">{message}</p>

          {/* Caja de advertencia */}
          <div className="border border-primary rounded-md px-4 py-2 text-sm text-primary mb-6 bg-accent/40">
            Esta acción es permanente y no se puede deshacer.
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border border-secondary text-secondary hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Eliminar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



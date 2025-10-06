import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader className="flex items-center justify-between pb-4">
          <DialogTitle className="text-xl font-bold text-primary">{title}</DialogTitle>
          <DialogClose asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="text-sm text-foreground mb-4">
          {message}
        </DialogDescription>

        <div className="border border-primary rounded-md px-4 py-2 text-sm text-primary mb-6 bg-accent/40">
          Esta acción es permanente y no se puede deshacer.
        </div>

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
      </DialogContent>
    </Dialog>
  );
}



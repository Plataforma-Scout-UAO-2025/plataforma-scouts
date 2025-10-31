import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApiError } from '../hooks/useApiError';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  onSuccess?: () => void;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  onSuccess,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const handleConfirm = async () => {
    clearError();
    setIsDeleting(true);
    
    try {
      await onConfirm();
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      handleError(error);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-primary">{title}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-sm text-foreground mb-4">
          {message}
        </DialogDescription>

        <div className="border border-primary rounded-md px-4 py-2 text-sm text-primary mb-6 bg-accent/40">
          Esta acción es permanente y no se puede deshacer.
        </div>

        {/* Mostrar error si existe */}
        {error.hasError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 mb-4">
            <p className="text-sm text-destructive">{error.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border border-secondary text-secondary hover:bg-accent"
          >
            Cancelar
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary-hover"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
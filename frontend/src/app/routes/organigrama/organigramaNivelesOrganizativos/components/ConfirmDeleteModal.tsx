import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  type: "nivel" | "cargo";
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ open, type, name, onClose, onConfirm }: Props) {
  const label = type === "nivel" ? "Nivel" : "Cargo";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card p-6 border border-border shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Confirmar Eliminación de {label}
          </DialogTitle>
        </DialogHeader>

        <p className="text-accent-foreground mb-6 text-sm">
          ¿Estás seguro de que quieres eliminar el {label.toLowerCase()} <b>{name}</b>? <br />
          <span className="text-muted-foreground">
            Esta acción es permanente y no se puede deshacer.
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-secondary text-secondary hover:bg-accent hover:text-secondary-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary text-white hover:bg-primary-hover"
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

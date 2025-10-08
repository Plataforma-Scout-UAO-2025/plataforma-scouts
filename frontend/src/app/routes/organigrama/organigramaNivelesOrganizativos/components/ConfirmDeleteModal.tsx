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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 text-2xl font-bold">
            Confirmar Eliminación de {label}
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-700 mb-4">
          ¿Estás seguro de que quieres eliminar el {label.toLowerCase()} <b>{name}</b>?<br />
          Esta acción es permanente y no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Eliminar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

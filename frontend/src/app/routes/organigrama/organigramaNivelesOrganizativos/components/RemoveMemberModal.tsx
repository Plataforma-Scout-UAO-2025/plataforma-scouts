import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  memberLabel?: string;
  cargoName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RemoveMemberModal({ open, memberLabel, cargoName, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card p-6 border border-border shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Quitar miembro del cargo
          </DialogTitle>
          <DialogDescription>
            Esta acción no elimina al miembro del sistema. Solo lo desasigna del cargo seleccionado.
          </DialogDescription>
        </DialogHeader>

        <p className="text-accent-foreground mb-6 text-sm">
          ¿Deseas quitar {memberLabel ? <b>{memberLabel}</b> : "este miembro"} del cargo {cargoName ? <><b>{cargoName}</b></> : null}?
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
            variant="destructive"
            className="text-white"
          >
            Quitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

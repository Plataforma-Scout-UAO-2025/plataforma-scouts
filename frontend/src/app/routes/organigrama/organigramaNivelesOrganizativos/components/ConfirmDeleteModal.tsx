import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  type: "nivel" | "cargo";
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  /** Texto de advertencia adicional (opcional) */
  warning?: string;
  /** Si es true, se deshabilita la acción de eliminar (p.ej. cuando no se puede eliminar un nivel con asociaciones) */
  disableConfirm?: boolean;
}

export default function ConfirmDeleteModal({ open, type, name, onClose, onConfirm, warning, disableConfirm = false }: Props) {
  const label = type === "nivel" ? "Nivel" : "Cargo";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card p-6 border border-border shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Confirmar Eliminación de {label}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el {label.toLowerCase()} seleccionado.
          </DialogDescription>
        </DialogHeader>

        {warning && (
          <div className="mb-4 p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
            {warning}
          </div>
        )}

        <p className="text-accent-foreground mb-6 text-sm">
          {disableConfirm ? (
            <>
              No es posible eliminar el {label.toLowerCase()} <b>{name}</b> en este momento.
              <br />
              <span className="text-muted-foreground">
                Resuelve las dependencias indicadas en la advertencia para poder continuar.
              </span>
            </>
          ) : (
            <>
              ¿Estás seguro de que quieres eliminar el {label.toLowerCase()} <b>{name}
              </b>? <br />
              <span className="text-muted-foreground">
                Esta acción es permanente y no se puede deshacer.
              </span>
            </>
          )}
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
            disabled={disableConfirm}
            aria-disabled={disableConfirm}
            title={disableConfirm ? "No se puede eliminar mientras existan asociaciones" : undefined}
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

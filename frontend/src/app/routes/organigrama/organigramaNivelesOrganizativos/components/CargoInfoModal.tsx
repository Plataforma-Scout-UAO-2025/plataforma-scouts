import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CargoInfoModalProps {
  open: boolean;
  onClose: () => void;
  cargoName: string;
  personName: string;
  personDescription?: string;
}

export default function CargoInfoModal({
  open,
  onClose,
  cargoName,
  personName,
  personDescription,
}: CargoInfoModalProps) {
  // Sin sección de foto, se simplifica el modal

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="w-[92vw] max-w-[560px] sm:max-w-lg md:max-w-xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Información del Cargo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* 1. Nombre del cargo */}
          <div>
            <span className="font-semibold">Cargo:</span> {cargoName}
          </div>

          {/* 2. Nombre de la persona asignada */}
          <div>
            <span className="font-semibold">Persona asignada:</span> {personName}
          </div>

          {/* 3. Descripción (debajo) */}
          <div>
            <span className="font-semibold">Descripción:</span>
            <div className="text-sm text-muted-foreground mt-1">
              {personDescription || "Sin descripción"}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

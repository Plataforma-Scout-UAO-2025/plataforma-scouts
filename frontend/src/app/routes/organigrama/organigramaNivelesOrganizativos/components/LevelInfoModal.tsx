import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LevelInfoModalProps {
  open: boolean;
  onClose: () => void;
  levelName: string;
  cargos: string[];
}

export default function LevelInfoModal({ open, onClose, levelName, cargos }: LevelInfoModalProps) {
  const hasCargos = Array.isArray(cargos) && cargos.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[560px] sm:max-w-lg md:max-w-xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Información del Nivel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Nivel:</span> {levelName}
          </div>
          <div>
            <span className="font-semibold">Cargos asociados:</span>
            {hasCargos ? (
              <ul className="list-disc ml-5 mt-2 text-sm text-muted-foreground space-y-1">
                {cargos.map((c, idx) => (
                  <li key={`${c}-${idx}`}>{c}</li>
                ))}
              </ul>
            ) : (
              <span className="ml-2">No hay cargos asociados</span>
            )}
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string, descripcion?: string) => void;
}

export default function CreateNivelModal({ open, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSave = () => {
    if (!nombre.trim()) return;
    onSave(nombre, descripcion);
    setNombre("");
    setDescripcion("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card border border-border shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Crear Nuevo Nivel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Nombre del Nivel *
            </label>
            <Input
              placeholder="Ej: Administrativo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Descripción
            </label>
            <Textarea
              placeholder="Descripción opcional del nivel..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border border-secondary text-secondary hover:bg-accent hover:text-secondary-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-white hover:bg-primary-hover"
            >
              Guardar Nivel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string, titular: string, descripcion?: string) => void;
  /** Valor inicial opcional para el campo nombre */
  initialNombre?: string;
}

export default function CreateCargoModal({ open, onClose, onSave, initialNombre }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSave = () => {
    if (!nombre.trim()) return;
    // Ya no asignamos persona aquí; titular vacío
    onSave(nombre, "", descripcion);
    setNombre("");
    setDescripcion("");
  };

  // Precargar nombre cuando se abre el modal si se proporcionó initialNombre
  // No sobreescribimos si el usuario ya ha tipeado un valor
  useEffect(() => {
    if (open) {
      if (initialNombre && !nombre) {
        setNombre(initialNombre);
      }
    } else {
      // Limpiar campos al cerrar
      setNombre("");
      setDescripcion("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialNombre]);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card border border-border shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Crear Nuevo Cargo
          </DialogTitle>
          <DialogDescription>
            Define el nombre y una descripción opcional para el cargo dentro del nivel organizativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Nombre del Cargo *
            </label>
            <Input
              placeholder="Ej: Tesorero"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Descripción
            </label>
            <Textarea
              placeholder="Descripción opcional del cargo..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full"
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
              Guardar Cargo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

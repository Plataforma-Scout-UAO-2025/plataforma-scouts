import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { Cargo } from "../types/niveles.types";

interface Props {
  open: boolean;
  cargo: Cargo | null;
  onClose: () => void;
  // Devuelve el cargo editado (sin asignación de miembro)
  onSave: (cargo: Cargo) => void;
}

export default function EditCargoModal({ open, cargo, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (cargo) {
      setNombre(cargo.nombre);
      setDescripcion(cargo.descripcion || "");
    }
  }, [cargo]);

  const handleSave = () => {
    if (!cargo) return;
    // Ya no gestionamos asignación de persona desde este modal
    onSave({ ...cargo, nombre, descripcion });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card border border-border shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Editar Cargo
          </DialogTitle>
          <DialogDescription>
            Actualiza el nombre y la descripción del cargo. La asignación de miembros se realiza en el modal dedicado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Nombre del Cargo *
            </label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          {/* Campo de asignación de persona removido. Usar AddMemberModal para asignar miembros. */}

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Descripción
            </label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
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
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

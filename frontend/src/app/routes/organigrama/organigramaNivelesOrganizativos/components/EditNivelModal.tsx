import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import type { Nivel } from "../types/niveles.types";

interface Props {
  open: boolean;
  nivel: Nivel | null;
  onClose: () => void;
  onSave: (nivel: Nivel) => void;
}

export default function EditNivelModal({ open, nivel, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (nivel) {
      setNombre(nivel.nombre);
      setDescripcion(nivel.descripcion || "");
    }
  }, [nivel]);

  const handleSave = () => {
    if (!nivel) return;
    onSave({ ...nivel, nombre, descripcion });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 text-2xl font-bold">Editar Nivel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Nivel *</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button className="bg-emerald-900 hover:bg-emerald-800" onClick={handleSave}>Guardar Cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

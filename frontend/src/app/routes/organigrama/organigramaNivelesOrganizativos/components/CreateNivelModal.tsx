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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 text-2xl font-bold">Crear Nuevo Nivel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Nivel *</label>
            <Input placeholder="Ej: Administrativo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea placeholder="Descripción opcional del nivel..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button className="bg-emerald-900 hover:bg-emerald-800" onClick={handleSave}>Guardar Nivel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

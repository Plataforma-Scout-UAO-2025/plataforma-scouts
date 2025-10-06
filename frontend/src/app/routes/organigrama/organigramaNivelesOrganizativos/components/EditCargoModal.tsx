import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { Cargo } from "../types/niveles.types";

interface Props {
  open: boolean;
  cargo: Cargo | null;
  onClose: () => void;
  onSave: (cargo: Cargo) => void;
}

export default function EditCargoModal({ open, cargo, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [titular, setTitular] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (cargo) {
      setNombre(cargo.nombre);
      setTitular(cargo.titular || "");
      setDescripcion((cargo as any).descripcion || "");
    }
  }, [cargo]);

  const handleSave = () => {
    if (!cargo) return;
    onSave({ ...cargo, nombre, titular, descripcion });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 text-2xl font-bold">Editar Cargo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Cargo *</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Persona Asignada *</label>
            <Input value={titular} onChange={(e) => setTitular(e.target.value)} />
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

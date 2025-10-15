import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "@/types/member.type";
import { deepCamelize } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string, titular: string, descripcion?: string) => void;
}

export default function CreateCargoModal({ open, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [titular, setTitular] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const memberOptions = useMemo(() => {
    return (members || [])
      .map((m) => {
        const rec = deepCamelize(m) as unknown as Record<string, unknown>;
        const memberId = rec['memberId'] ?? rec['member_id'] ?? rec['id'];
        const firstName = String(rec['firstName'] ?? rec['first_name'] ?? "");
        const lastName = String(rec['lastName'] ?? rec['last_name'] ?? "");
        return memberId ? { id: String(memberId), name: `${firstName} ${lastName}`.trim() } : null;
      })
      .filter((x): x is { id: string; name: string } => x !== null);
  }, [members]);

  const handleSave = () => {
    if (!nombre.trim() || !titular.trim()) return;
    onSave(nombre, titular, descripcion);
    setNombre("");
    setTitular("");
    setDescripcion("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-900 text-2xl font-bold">Crear Nuevo Cargo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Cargo *</label>
            <Input placeholder="Ej: Tesorero" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Persona Asignada *</label>
            <Input placeholder="Ej: Luis Fernández" value={titular} onChange={(e) => setTitular(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea placeholder="Descripción opcional del cargo..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button className="bg-emerald-900 hover:bg-emerald-800" onClick={handleSave}>Guardar Cargo</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

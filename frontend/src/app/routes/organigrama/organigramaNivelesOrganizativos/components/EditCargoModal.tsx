import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import type { Cargo } from "../types/niveles.types";
import type { Member } from "@/types/member.type";
import { normalizeRawRole, RawRole, getRoleLabel } from "@/roles/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  cargo: Cargo | null;
  onClose: () => void;
  // Permite devolver el cargo editado y opcionalmente el miembro a asignar al cargo
  onSave: (cargo: Cargo, assignMemberId?: string) => void;
  members?: Member[];
}

export default function EditCargoModal({ open, cargo, onClose, onSave, members = [] }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  type MemberOption = { id: string; label: string; displayName: string };
  const memberOptions: MemberOption[] = useMemo(() => {
    return (members || [])
      .map((m) => {
        const rec = m as unknown as Record<string, unknown>;
        const memberId = rec["memberId"] ?? rec["member_id"] ?? rec["id"];
        const firstName = String(rec["firstName"] ?? rec["first_name"] ?? "");
        const lastName = String(rec["lastName"] ?? rec["last_name"] ?? "");

        const rawRoleSingle = rec["role"] as string | undefined;
        const rawRolesList = Array.isArray(rec["roles"]) ? (rec["roles"] as string[]) : undefined;
        const collected = rawRolesList ?? (rawRoleSingle ? [rawRoleSingle] : []);
        const normalized = Array.from(new Set(collected.map((r) => normalizeRawRole(r))));
        const withoutScout = normalized.filter((r) => r !== RawRole.SCOUT);

        if (!memberId || withoutScout.length === 0) return null;

        const rolesLabel = withoutScout.map((r) => getRoleLabel(r)).join(", ");
        const displayName = `${firstName} ${lastName}`.trim();
        const label = rolesLabel ? `${displayName} — ${rolesLabel}` : displayName;
        return { id: String(memberId), label, displayName } as MemberOption;
      })
      .filter((x): x is MemberOption => x !== null);
  }, [members]);

  useEffect(() => {
    if (cargo) {
      setNombre(cargo.nombre);
      setDescripcion(cargo.descripcion || "");
      setSelectedMemberId(null);
    }
  }, [cargo]);

  const handleSave = () => {
    if (!cargo) return;
    let titularValue = cargo.titular || "";
    if (selectedMemberId) {
      const selected = memberOptions.find((m) => m.id === selectedMemberId);
      if (selected) titularValue = selected.displayName;
    }
    // Devolvemos también el memberId seleccionado para que el padre lo asigne al cargo
    onSave({ ...cargo, nombre, titular: titularValue, descripcion }, selectedMemberId ?? undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card border border-border shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Editar Cargo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Nombre del Cargo *
            </label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Persona Asignada
            </label>
            {memberOptions.length > 0 ? (
              <Select
                value={selectedMemberId ?? undefined}
                onValueChange={(v) => setSelectedMemberId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No hay miembros disponibles para asignar.
              </div>
            )}
          </div>

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

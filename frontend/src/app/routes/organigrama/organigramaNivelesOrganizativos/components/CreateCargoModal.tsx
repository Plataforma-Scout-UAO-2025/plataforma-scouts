import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "@/types/member.type";
import { normalizeRawRole, RawRole, getRoleLabel } from "@/roles/roles";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (nombre: string, titular: string, descripcion?: string) => void;
  members?: Member[];
  /** Valor inicial opcional para el campo nombre */
  initialNombre?: string;
}

export default function CreateCargoModal({ open, onClose, onSave, members = [], initialNombre }: Props) {
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

        // Extraer roles desde backend o Auth0
        // Soportar tanto un único role (string) como una lista (roles: string[])
        const rawRoleSingle = rec["role"] as string | undefined;
        const rawRolesList = Array.isArray(rec["roles"]) ? (rec["roles"] as string[]) : undefined;
        const collected = rawRolesList ?? (rawRoleSingle ? [rawRoleSingle] : []);
        const normalized = Array.from(new Set(collected.map((r) => normalizeRawRole(r))));
        // Excluir el rol SCOUT para niveles organizativos
        const withoutScout = normalized.filter((r) => r !== RawRole.SCOUT);

        // Si después de excluir SCOUT no quedan roles, no incluimos al miembro en la lista
        if (!memberId || withoutScout.length === 0) return null;

        const rolesLabel = withoutScout.map((r) => getRoleLabel(r)).join(", ");
        const displayName = `${firstName} ${lastName}`.trim();
        const label = rolesLabel ? `${displayName} — ${rolesLabel}` : displayName;
        return { id: String(memberId), label, displayName } as MemberOption;
      })
      .filter((x): x is MemberOption => x !== null);
  }, [members]);

  const handleSave = () => {
    if (!nombre.trim()) return;
    if (!selectedMemberId) return;
  const selected = memberOptions.find((m) => m.id === selectedMemberId);
    if (!selected) return;
  const titularValue = selected.displayName;
    onSave(nombre, titularValue, descripcion);
    setNombre("");
    setDescripcion("");
    setSelectedMemberId(null);
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
      setSelectedMemberId(null);
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
            />
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
            <Textarea
              placeholder="Descripción opcional del cargo..."
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
              Guardar Cargo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

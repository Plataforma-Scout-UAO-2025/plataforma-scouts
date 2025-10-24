import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cargo } from "../types/niveles.types";
import type { Member } from "@/types/member.type";
import { normalizeRawRole, RawRole, getRoleLabel } from "@/roles/roles";

interface Props {
  open: boolean;
  cargo: Cargo | null;
  onClose: () => void;
  /** Devuelve el memberId seleccionado para asignarlo al cargo */
  onAssign: (memberId: string) => void;
  members?: Member[];
}

export default function AddMemberModal({ open, cargo, onClose, onAssign, members = [] }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  type MemberOption = { id: string; label: string };
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
        return { id: String(memberId), label } as MemberOption;
      })
      .filter((x): x is MemberOption => x !== null);
  }, [members]);

  useEffect(() => {
    // Reset selection when opening a different cargo
    setSelectedMemberId(undefined);
  }, [cargo?.id, open]);

  const handleAssign = () => {
    if (!selectedMemberId) return;
    onAssign(selectedMemberId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl bg-card border border-border shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-extrabold">
            Agregar miembro al cargo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Cargo seleccionado: <span className="font-medium text-foreground">{cargo?.nombre ?? ""}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Selecciona un miembro
            </label>
            {memberOptions.length > 0 ? (
              <Select value={selectedMemberId} onValueChange={(v) => setSelectedMemberId(v)}>
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

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border border-secondary text-secondary hover:bg-accent hover:text-secondary-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedMemberId}
              className="bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Asignar miembro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

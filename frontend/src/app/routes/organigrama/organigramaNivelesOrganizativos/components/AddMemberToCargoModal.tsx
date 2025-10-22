import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import type { Cargo } from "../types/niveles.types";
import type { Member } from "@/types/member.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeRawRole, RawRole, getRoleLabel } from "@/roles/roles";

interface Props {
  open: boolean;
  cargo: Cargo | null;
  members?: Member[];
  onClose: () => void;
  onSave: (assignMemberId: string) => void;
}

export default function AddMemberToCargoModal({ open, cargo, members = [], onClose, onSave }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  type MemberOption = { id: string; label: string };
  const memberOptions: MemberOption[] = useMemo(() => {
    return (members || [])
      .map((m) => {
        const rec = m as unknown as Record<string, unknown>;
        const id = rec["memberId"] ?? rec["member_id"] ?? rec["id"];
        const first = String(rec["firstName"] ?? rec["first_name"] ?? "").trim();
        const last = String(rec["lastName"] ?? rec["last_name"] ?? "").trim();
        const full = `${first} ${last}`.trim();
        // roles: single or list; exclude SCOUT
        const rawRoleSingle = rec["role"] as string | undefined;
        const rawRolesList = Array.isArray(rec["roles"]) ? (rec["roles"] as string[]) : undefined;
        const collected = rawRolesList ?? (rawRoleSingle ? [rawRoleSingle] : []);
        const normalized = Array.from(new Set(collected.map((r) => normalizeRawRole(r))));
        const withoutScout = normalized.filter((r) => r !== RawRole.SCOUT);
        // Excluir miembros que solo tienen rol SCOUT (o cuya lista queda vacía tras filtrar)
        if (withoutScout.length === 0) return null;
        const rolesLabel = withoutScout.map((r) => getRoleLabel(r)).join(", ");
        if (!id) return null;
        const label = rolesLabel ? `${full || String(id)} — ${rolesLabel}` : (full || String(id));
        return { id: String(id), label };
      })
      .filter((x): x is MemberOption => x !== null);
  }, [members]);

  useEffect(() => {
    if (open) {
      setSelectedMemberId(undefined);
    }
  }, [open]);

  const handleSave = () => {
    if (!cargo || !selectedMemberId) return;
    onSave(selectedMemberId);
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
            Cargo: <span className="font-medium text-foreground">{cargo?.nombre ?? "—"}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Miembro a asignar
            </label>
            {memberOptions.length > 0 ? (
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
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
              onClick={handleSave}
              disabled={!selectedMemberId}
              className="bg-primary text-white hover:bg-primary-hover"
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

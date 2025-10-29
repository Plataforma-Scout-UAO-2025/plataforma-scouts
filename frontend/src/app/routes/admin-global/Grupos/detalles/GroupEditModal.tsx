import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
import { updateGroupAction } from "@/store/groups/groupsActions";
import type { GroupResponseDTO as Group, UpdateGroupDTO } from "@/types/group.type";

interface GroupEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onSave?: (updated: Group) => void;
}

export default function GroupEditModal({
  open,
  onOpenChange,
  group,
  onSave,
}: GroupEditModalProps) {
  const [form, setForm] = useState<Partial<Group>>({});
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (group) {
      setForm({
        ...group,
      });
    } else {
      setForm({});
    }
  }, [group]);

  if (!group) return null;

  const updateField = <K extends keyof Group>(
    key: K,
    value: Group[K] | undefined
  ) => {
    setForm((prev) => ({ ...(prev as object), [key]: value }));
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // derive tenant and slug from the passed group
  const tenantId = group.tenant_id;
  const groupSlug = group.slug;

  const buildUpdates = (): Partial<UpdateGroupDTO> => {
    const u: Partial<UpdateGroupDTO> = {};
    if (typeof form.name !== "undefined" && form.name !== group.name) u.name = form.name as string;
    if (typeof form.email !== "undefined" && form.email !== group.email) u.email = form.email as string;
    if (typeof form.phone !== "undefined" && form.phone !== group.phone) u.phone = form.phone as string;
    if (typeof form.district !== "undefined" && form.district !== group.district) u.district = form.district as string;
    if (typeof form.isActive !== "undefined" && form.isActive !== group.isActive) u.isActive = form.isActive as boolean;
    return u;
  };

  const handleSave = async () => {
    const updates = buildUpdates();

    if (!tenantId || !groupSlug) {
      console.error("Cannot update group: missing tenantId or groupSlug", { tenantId, groupSlug });
      return;
    }

    if (Object.keys(updates).length === 0) {
      onOpenChange(false);
      return;
    }

    try {
      console.debug("Dispatching updateGroupAction", { tenantId, groupSlug, updates });
      const action = await dispatch(updateGroupAction({ tenantId, groupSlug, updates }));
      console.debug("updateGroupAction result", action);
      console.log("Group update action:", action);

      if (updateGroupAction.fulfilled.match(action)) {
        const merged: Group = { ...(group as Group), ...(form as Partial<Group>) };
        if (onSave) onSave(merged);
        onOpenChange(false);
      } else {
        console.error("Update rejected", action);
      }
    } catch (err) {
      console.error("Error dispatching updateGroupAction", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-white rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Información general
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-sm text-accent-foreground">Nombre</Label>
              <Input
                className="mt-1 w-full"
                value={form.name ?? ""}
                onChange={(e) =>
                  updateField("name" as keyof Group, e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">
                Identificador (slug)
              </Label>
              <Input
                className="mt-1 w-full"
                value={form.slug ?? ""}
                onChange={(e) =>
                  updateField("slug" as keyof Group, e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">
                Correo electrónico
              </Label>
              <Input
                type="email"
                className="mt-1 w-full"
                value={form.email ?? ""}
                onChange={(e) =>
                  updateField("email" as keyof Group, e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Teléfono</Label>
              <Input
                className="mt-1 w-full"
                value={form.phone ?? ""}
                onChange={(e) =>
                  updateField("phone" as keyof Group, e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Distrito</Label>
              <Input
                className="mt-1 w-full"
                value={form.district ?? ""}
                onChange={(e) =>
                  updateField("district" as keyof Group, e.target.value)
                }
              />
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-full">
                <label className="text-sm text-gray-500">Estado</label>
                <div className="mt-2">
                  <Select
                    value={String(!!form.isActive)}
                    onValueChange={(val) =>
                      updateField("isActive" as keyof Group, val === "true")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

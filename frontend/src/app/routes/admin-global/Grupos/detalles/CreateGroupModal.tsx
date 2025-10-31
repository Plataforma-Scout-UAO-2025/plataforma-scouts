import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui";
import { useState } from "react";
import type { GroupResponseDTO as Group } from "@/types/group.type";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updated: Group) => void;
}

export default function CreateGroupModal({
  open,
  onOpenChange,
  onSave,
}: CreateGroupModalProps) {
  const [form, setForm] = useState<Partial<Group>>({ isActive: true });

  const updateField = <K extends keyof Group>(
    key: K,
    value: Group[K] | undefined
  ) => {
    setForm((prev) => ({ ...(prev as object), [key]: value }));
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (onSave && form) {
      onSave(form as Group);
    }
    onOpenChange(false);
  };

  console.log(form);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Crear Grupo
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

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { updateGroupAction, fetchGroupsAction } from "@/store/groups/groupsActions";
import { clearNotification } from "@/store/groups/groupsSlice";
import type {
  GroupResponseDTO as Group,
  UpdateGroupDTO,
} from "@/types/group.type";
import { useGroup } from "@/hooks/useGroup";

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
  const { message, error } = useGroup();
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearNotification());
      onOpenChange(false);
    }
    if (error) {
      toast.error(error);
      dispatch(clearNotification());
    }
  }, [message, error, dispatch, onOpenChange]);

  useEffect(() => {
    setForm(group ? { ...group } : {});
  }, [group]);

  if (!group) return null;

  const handleChange = <K extends keyof Group>(field: K, value: Group[K]) => {
    if (field === 'isActive') {
      setForm((prev) => ({
        ...prev,
        isActive: Boolean(value),
        status: value ? 'ACTIVE' : 'INACTIVE',
      }));
    } else if (field === 'status') {
      setForm((prev) => ({
        ...prev,
        status: String(value),
        isActive: String(value) === 'ACTIVE',
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCancel = () => onOpenChange(false);

  const handleSave = async () => {
    const tenantId = group.tenant_id;
    const groupSlug = group.slug;
    const updates: Partial<UpdateGroupDTO & { is_active?: boolean }> = Object.fromEntries(
      (Object.keys(form) as Array<keyof Group>)
        .filter((key) => form[key] !== group[key])
        .map((key) => [key, form[key]])
    );
    // Always send both status and is_active if either changed
    if ('status' in updates) {
      updates['status'] = form.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      updates['is_active'] = form.status === 'ACTIVE';
    }
    if ('isActive' in updates && !('status' in updates)) {
      updates['is_active'] = Boolean(form.isActive);
      updates['status'] = form.isActive ? 'ACTIVE' : 'INACTIVE';
      delete updates['isActive'];
    }
    if ('isActive' in updates) {
      delete updates['isActive'];
    }
    if (Object.keys(updates).length === 0) {
      onOpenChange(false);
      return;
    }

    const action = await dispatch(
      updateGroupAction({ tenantId, groupSlug, updates })
    );
    if (updateGroupAction.fulfilled.match(action)) {
      await dispatch(fetchGroupsAction());
      if (onSave) onSave({ ...group, ...form });
      onOpenChange(false);
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
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">
                Identificador (slug)
              </Label>
              <Input
                className="mt-1 w-full"
                value={form.slug ?? ""}
                onChange={(e) => handleChange("slug", e.target.value)}
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
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Teléfono</Label>
              <Input
                className="mt-1 w-full"
                value={form.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Distrito</Label>
              <Input
                className="mt-1 w-full"
                value={form.district ?? ""}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-full">
                <label className="text-sm text-gray-500">Estado</label>
                <div className="mt-2">
                  <Select
                    value={form.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                    onValueChange={(val) => handleChange('status', val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
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

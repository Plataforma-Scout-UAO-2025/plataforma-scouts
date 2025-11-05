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
import { Button, Input, Label, ImageUpload } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Textarea,
} from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateGroupAction, fetchGroupsWithAdminsAction } from "@/store/groups/groupsActions";
import { clearNotification } from "@/store/groups/groupsSlice";
import type {
  UpdateGroupDTO,
} from "@/types/group.type";
import { useGroup } from "@/hooks/useGroup";
import { uploadPhotoFile } from "@/lib/imageUtils";

interface GroupEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UpdateGroupDTO | null;
  onSave?: (updated: UpdateGroupDTO) => void;
}

export default function GroupEditModal({
  open,
  onOpenChange,
  group,
  onSave,
}: GroupEditModalProps) {
  const [form, setForm] = useState<Partial<UpdateGroupDTO>>({});
  const [logoChanged, setLogoChanged] = useState(false);
  const [scarfChanged, setScarfChanged] = useState(false);
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
    if (group) {
      setForm({ ...group });
      setLogoChanged(false);
      setScarfChanged(false);
    } else {
      setForm({});
    }
  }, [group]);

  if (!group) return null;

  const handleChange = <K extends keyof UpdateGroupDTO>(field: K, value: UpdateGroupDTO[K]) => {
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
        is_active: String(value) === 'ACTIVE',
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCancel = () => onOpenChange(false);

  const handleSave = async () => {
    const tenantId = group.tenant_id;
    const groupSlug = group.slug;
    if (!groupSlug || !tenantId) {
      toast.error("Group slug or tenant ID is missing");
      return;
    }

    const updates: Partial<UpdateGroupDTO & { is_active?: boolean }> = Object.fromEntries(
      (Object.keys(form) as Array<keyof UpdateGroupDTO>)
        .filter((key) => {
          // Excluir logo y scarf del update general, se manejan por separado
          if (key === 'logoObjectId' || key === 'scarfObjectId') return false;
          return form[key] !== group[key];
        })
        .map((key) => [key, form[key]])
    );
    
    if ('status' in updates) {
      updates['status'] = form.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      updates['isActive'] = form.status === 'ACTIVE';
    }
    if ('isActive' in updates && !('status' in updates)) {
      updates['isActive'] = Boolean(form.isActive);
      updates['status'] = form.isActive ? 'ACTIVE' : 'INACTIVE';
      delete updates['is_active'];
    }
    if ('isActive' in updates) {
      delete updates['isActive'];
    }

    if (Object.keys(updates).length > 0) {
      const action = await dispatch(
        updateGroupAction({ tenantId, groupSlug, updates })
      );
      if (!updateGroupAction.fulfilled.match(action)) {
        return; 
      }
    }

    // Actualizar logo si cambió
    if (logoChanged && form.logoObjectId) {
      try {
        const { updateGroupLogo } = await import('@/api/groupsApi');
        await updateGroupLogo(tenantId, groupSlug, form.logoObjectId);
        toast.success("Logo actualizado correctamente");
      } catch (err) {
        console.error("Error actualizando logo:", err);
        toast.error("Error al actualizar el logo");
        return;
      }
    }

    // Actualizar scarf si cambió
    if (scarfChanged && form.scarfObjectId) {
      try {
        const { updateGroupScarf } = await import('@/api/groupsApi');
        await updateGroupScarf(tenantId, groupSlug, form.scarfObjectId);
        toast.success("Pañoleta actualizada correctamente");
      } catch (err) {
        console.error("Error actualizando pañoleta:", err);
        toast.error("Error al actualizar la pañoleta");
        return;
      }
    }

    // Recargar datos
    await dispatch(fetchGroupsWithAdminsAction());
    if (onSave) onSave({ ...group, ...form });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Grupo
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 bg-white rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Información general
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-accent-foreground">Nombre</Label>
              <Input
                className="mt-1 w-full"
                value={form.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
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
            <div>
              <Label className="text-sm text-accent-foreground">
                Número de identificación
              </Label>
              <Input
                className="mt-1 w-full"
                value={form.identifierNumber ?? ""}
                onChange={(e) => handleChange("identifierNumber", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Dirección</Label>
              <Input
                className="mt-1 w-full"
                value={form.address ?? ""}
                onChange={(e) => handleChange("address", e.target.value)}
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
              <Label className="text-sm text-accent-foreground">
                Fecha de fundación
              </Label>
              <Popover>
                <PopoverTrigger asChild className="bg-white">
                  <Button
                    variant="outline"
                    className="mt-1 w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.foundedIn ? (
                      format(new Date(form.foundedIn), "PPP", { locale: es })
                    ) : (
                      <span className="text-muted-foreground">Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.foundedIn ? new Date(form.foundedIn) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleChange("foundedIn", date as unknown as UpdateGroupDTO["foundedIn"]);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    defaultMonth={form.foundedIn ? new Date(form.foundedIn) : undefined}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Lema</Label>
              <Input
                className="mt-1 w-full"
                value={form.motto ?? ""}
                onChange={(e) => handleChange("motto", e.target.value)}
              />
            </div>
            <div>
              <ImageUpload
                label="Logo del grupo"
                value={form.logoObjectId ?? ""}
                onChange={(objectId) => {
                  handleChange("logoObjectId", objectId);
                  setLogoChanged(true);
                }}
                onUpload={uploadPhotoFile}
              />
            </div>
            <div>
              <ImageUpload
                label="Pañoleta del grupo"
                value={form.scarfObjectId ?? ""}
                onChange={(objectId) => {
                  handleChange("scarfObjectId", objectId);
                  setScarfChanged(true);
                }}
                onUpload={uploadPhotoFile}
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Estado</Label>
              <Select
                value={form.status ?? group.status ?? 'INACTIVE'}
                onValueChange={(val) => handleChange('status', val)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Misión</Label>
              <Textarea
                className="mt-1 w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.mission ?? ""}
                onChange={(e) => handleChange("mission", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Visión</Label>
              <Textarea
                className="mt-1 w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.vision ?? ""}
                onChange={(e) => handleChange("vision", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Historia</Label>
              <Textarea
                className="mt-1 w-full min-h-[100px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.history ?? ""}
                onChange={(e) => handleChange("history", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground mb-2 block">
                Redes sociales
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Sitio web</Label>
                  <Input
                    className="mt-1"
                    placeholder="https://ejemplo.com"
                    value={(form.socialLinks as Record<string, string>)?.website ?? ""}
                    onChange={(e) => {
                      const currentLinks = (form.socialLinks as Record<string, string>) || {};
                      handleChange("socialLinks", {
                        ...currentLinks,
                        website: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Facebook</Label>
                  <Input
                    className="mt-1"
                    placeholder="https://facebook.com/..."
                    value={(form.socialLinks as Record<string, string>)?.facebook ?? ""}
                    onChange={(e) => {
                      const currentLinks = (form.socialLinks as Record<string, string>) || {};
                      handleChange("socialLinks", {
                        ...currentLinks,
                        facebook: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Instagram</Label>
                  <Input
                    className="mt-1"
                    placeholder="https://instagram.com/..."
                    value={(form.socialLinks as Record<string, string>)?.instagram ?? ""}
                    onChange={(e) => {
                      const currentLinks = (form.socialLinks as Record<string, string>) || {};
                      handleChange("socialLinks", {
                        ...currentLinks,
                        instagram: e.target.value,
                      });
                    }}
                  />
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

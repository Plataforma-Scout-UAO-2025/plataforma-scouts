import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  createGroupAction,
  fetchGroupsWithAdminsAction,
  validateGroupSlugAction,
} from "@/store/groups/groupsActions";
import {
  clearNotification,
  resetSlugValidation,
} from "@/store/groups/groupsSlice";
import type { CreateGroupDTO } from "@/types/group.type";
import { useGroup } from "@/hooks/useGroup";
import { uploadPhotoFile } from "@/lib/imageUtils";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (newGroup: CreateGroupDTO) => void;
}

export default function CreateGroupModal({
  open,
  onOpenChange,
  onSave,
}: CreateGroupModalProps) {
  const [form, setForm] = useState<Partial<CreateGroupDTO>>({
    isActive: true,
    status: "ACTIVE",
  });
  const dispatch = useDispatch<AppDispatch>();
  const { message, error, slugValidation } = useGroup();

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
    if (!open) {
      setForm({
        isActive: true,
        status: "ACTIVE",
      });
      dispatch(resetSlugValidation());
    }
  }, [open, dispatch]);

  const validateSlug = (slug: string) => {
    if (!slug || slug.trim() === "") {
      dispatch(resetSlugValidation());
      return;
    }

    dispatch(validateGroupSlugAction({ slug }));
  };

  const handleChange = <K extends keyof CreateGroupDTO>(
    field: K,
    value: CreateGroupDTO[K]
  ) => {
    if (field === "isActive") {
      setForm((prev) => ({
        ...prev,
        isActive: Boolean(value),
        status: value ? "ACTIVE" : "INACTIVE",
      }));
    } else if (field === "status") {
      setForm((prev) => ({
        ...prev,
        status: String(value),
        isActive: String(value) === "ACTIVE",
      }));
    } else if (field === "slug") {
      setForm((prev) => ({ ...prev, [field]: value }));
      const timeoutId = setTimeout(() => {
        validateSlug(String(value));
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCancel = () => onOpenChange(false);

  const handleSave = async () => {
    if (!form.name || form.name.trim() === "") {
      toast.error("El nombre del grupo es requerido");
      return;
    }

    if (!form.slug || form.slug.trim() === "") {
      toast.error("El slug es requerido");
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(form.slug)) {
      toast.error(
        "El slug solo puede contener letras minúsculas, números y guiones"
      );
      return;
    }

    if (slugValidation.error || slugValidation.isAvailable === false) {
      toast.error(
        slugValidation.error ||
          "El slug no está disponible o hay un error en la validación"
      );
      return;
    }

    if (slugValidation.isValidating) {
      toast.info("Esperando validación del slug...");
      return;
    }

    if (!form.email || form.email.trim() === "") {
      toast.error("El correo electrónico es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("El formato del correo electrónico no es válido");
      return;
    }

    const socialLinks = {
      website: (form.socialLinks as Record<string, string>)?.website || "",
      facebook: (form.socialLinks as Record<string, string>)?.facebook || "",
      instagram: (form.socialLinks as Record<string, string>)?.instagram || "",
    };

    const groupData = {
      tenant_id: "A", // Tenant por defecto para grupos globales
      slug: form.slug ?? "",
      name: form.name,
      district: form.district || null,
      identifier_number: form.identifierNumber || null,
      address: form.address || null,
      phone: form.phone || null,
      email: form.email,
      founded_in: form.foundedIn || null,
      motto: form.motto || null,
      mission: form.mission || null,
      vision: form.vision || null,
      history: form.history || null,
      logo_object_id: form.logoObjectId || null,
      scarf_object_id: form.scarfObjectId || null,
      social_links: socialLinks,
      config: form.config || null,
      is_active: form.isActive ?? true,
      status: form.status ?? "ACTIVE",
    };

    const action = await dispatch(createGroupAction(groupData));

    if (createGroupAction.fulfilled.match(action)) {
      await dispatch(fetchGroupsWithAdminsAction());
      if (onSave) onSave(form as CreateGroupDTO);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Crear Grupo
          </DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo grupo scout
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-white rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Información general
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-accent-foreground">Nombre *</Label>
              <Input
                className="mt-1 w-full"
                value={form.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre del grupo"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Slug *</Label>
              <Input
                className={`mt-1 w-full ${
                  slugValidation.error || slugValidation.isAvailable === false
                    ? "border-red-500"
                    : slugValidation.isAvailable === true
                    ? "border-green-500"
                    : ""
                }`}
                value={form.slug ?? ""}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="slug-del-grupo"
              />
              {slugValidation.isValidating && (
                <p className="text-xs text-gray-500 mt-1">Validando...</p>
              )}
              {slugValidation.error && (
                <p className="text-xs text-red-500 mt-1">
                  {slugValidation.error}
                </p>
              )}
              {!slugValidation.error &&
                slugValidation.isAvailable === false && (
                  <p className="text-xs text-red-500 mt-1">
                    Este slug ya está en uso
                  </p>
                )}
              {!slugValidation.error && slugValidation.isAvailable === true && (
                <p className="text-xs text-green-600 mt-1">Slug disponible</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Solo letras minúsculas, números y guiones
              </p>
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Distrito</Label>
              <Input
                className="mt-1 w-full"
                value={form.district ?? ""}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder="Distrito"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">
                Número de identificación
              </Label>
              <Input
                className="mt-1 w-full"
                value={form.identifierNumber ?? ""}
                onChange={(e) =>
                  handleChange("identifierNumber", e.target.value)
                }
                placeholder="Identificador"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">
                Dirección
              </Label>
              <Input
                className="mt-1 w-full"
                value={form.address ?? ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección física"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Teléfono</Label>
              <Input
                className="mt-1 w-full"
                value={form.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+57 300 1234567"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">
                Correo electrónico *
              </Label>
              <Input
                type="email"
                className="mt-1 w-full"
                value={form.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@ejemplo.com"
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
                      <span className="text-muted-foreground">
                        Seleccionar fecha
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={
                      form.foundedIn ? new Date(form.foundedIn) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        handleChange("foundedIn", date.toISOString());
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    defaultMonth={
                      form.foundedIn ? new Date(form.foundedIn) : undefined
                    }
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
                placeholder="Lema del grupo"
              />
            </div>
            <div>
              <Label className="text-sm text-accent-foreground">Estado</Label>
              <Select
                value={form.status ?? "ACTIVE"}
                onValueChange={(val) => handleChange("status", val)}
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
            <div>
              <ImageUpload
                label="Logo del grupo"
                value={form.logoObjectId ?? ""}
                onChange={(objectId) => handleChange("logoObjectId", objectId)}
                onUpload={uploadPhotoFile}
              />
            </div>
            <div>
              <ImageUpload
                label="Pañoleta del grupo"
                value={form.scarfObjectId ?? ""}
                onChange={(objectId) => handleChange("scarfObjectId", objectId)}
                onUpload={uploadPhotoFile}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Misión</Label>
              <Textarea
                className="mt-1 w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.mission ?? ""}
                onChange={(e) => handleChange("mission", e.target.value)}
                placeholder="Misión del grupo scout"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Visión</Label>
              <Textarea
                className="mt-1 w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.vision ?? ""}
                onChange={(e) => handleChange("vision", e.target.value)}
                placeholder="Visión del grupo scout"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Historia</Label>
              <Textarea
                className="mt-1 w-full min-h-[100px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.history ?? ""}
                onChange={(e) => handleChange("history", e.target.value)}
                placeholder="Historia del grupo scout"
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
                    value={
                      (form.socialLinks as Record<string, string>)?.website ??
                      ""
                    }
                    onChange={(e) => {
                      const currentLinks =
                        (form.socialLinks as Record<string, string>) || {};
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
                    value={
                      (form.socialLinks as Record<string, string>)?.facebook ??
                      ""
                    }
                    onChange={(e) => {
                      const currentLinks =
                        (form.socialLinks as Record<string, string>) || {};
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
                    value={
                      (form.socialLinks as Record<string, string>)?.instagram ??
                      ""
                    }
                    onChange={(e) => {
                      const currentLinks =
                        (form.socialLinks as Record<string, string>) || {};
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
            Crear Grupo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { createGroupMultipartAction, fetchGroupsAction, validateSlugAction } from "@/store/groups/groupsActions";
import { clearNotification } from "@/store/groups/groupsSlice";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useGroup } from "@/hooks/useGroup";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import SocialLinksInput from "@/components/groups/SocialLinksInput";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (created: Group) => void;
}

export default function CreateGroupModal({
  open,
  onOpenChange,
  onSave,
}: CreateGroupModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { orgId } = useAuth0ApiWrapper();
  const { slugValidation } = useGroup();
  const [form, setForm] = useState<Partial<Group>>({ isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Debounce para slug (1s)
  useEffect(() => {
    if (!form.slug || form.slug.trim().length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      dispatch(validateSlugAction(form.slug!.trim()));
    }, 1000);
    return () => clearTimeout(timer);
  }, [form.slug, dispatch]);

  // Debounce para email (1s) + regex local
  useEffect(() => {
    if (!form.email || form.email.trim().length === 0) {
      setEmailValid(null);
      return;
    }
    const timer = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(form.email!.trim()));
    }, 1000);
    return () => clearTimeout(timer);
  }, [form.email]);

  const updateField = <K extends keyof Group>(
    key: K,
    value: Group[K] | undefined
  ) => {
    setForm((prev) => ({ ...(prev as object), [key]: value }));
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!orgId) {
      setErrorMsg("No se pudo determinar el tenant (orgId)");
      return;
    }
    if (!form?.name || !form?.slug) {
      setErrorMsg("Nombre y slug son obligatorios");
      return;
    }
    
    // Validar fecha de fundación
    if ((form as any).foundedIn) {
      const foundedDate = new Date((form as any).foundedIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      
      if (foundedDate > today) {
        setErrorMsg("La fecha de fundación no puede ser mayor a la fecha actual");
        return;
      }
      
      // Validar que no sea una fecha absurda (antes del año 1900 o después del año actual)
      const year = foundedDate.getFullYear();
      if (year < 1900 || year > new Date().getFullYear()) {
        setErrorMsg("La fecha de fundación debe estar entre 1900 y el año actual");
        return;
      }
    }
    
    // Validar que no haya errores en la imagen
    if (imageError) {
      setErrorMsg("Por favor corrige el error en la imagen antes de continuar");
      return;
    }

    try {
      setSubmitting(true);

      const status = String((form as any).status ?? (form.isActive ? "ACTIVE" : "INACTIVE")).toUpperCase();
      const dto: Record<string, unknown> = {
        tenant_id: orgId,
        name: String(form.name),
        slug: String(form.slug),
        email: form.email ?? undefined,
        phone: form.phone ?? undefined,
        district: form.district ?? undefined,
        address: form.address ?? undefined,
        identifier_number: (form as any).identifierNumber ?? undefined,
        motto: (form as any).motto ?? undefined,
        mission: (form as any).mission ?? undefined,
        vision: (form as any).vision ?? undefined,
        history: (form as any).history ?? undefined,
        founded_in: (form as any).foundedIn ?? undefined,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        status,
        is_active: Boolean((form as any).isActive ?? form.isActive ?? true),
      };

      const action = await dispatch(
        createGroupMultipartAction({ 
          tenantId: orgId, 
          dto,
          image: imageFile || undefined,
        })
      );

      if (createGroupMultipartAction.fulfilled.match(action)) {
        // refrescar listado
        await dispatch(fetchGroupsAction());
        if (onSave && action.payload.newGroup) onSave(action.payload.newGroup);
        dispatch(clearNotification());
        onOpenChange(false);
      } else if (createGroupMultipartAction.rejected.match(action)) {
        const err = action.payload as { error?: string } | undefined;
        setErrorMsg(err?.error || "Error al crear el grupo");
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Crear Grupo
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="p-4 bg-white rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Información general
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {/* Indicador de validación de slug */}
              {form.slug && form.slug.trim().length > 0 && (
                <div className="mt-1">
                  {slugValidation.loading ? (
                    <p className="text-xs text-gray-500">Validando...</p>
                  ) : slugValidation.valid === true ? (
                    <p className="text-xs text-green-600">✓ Slug disponible</p>
                  ) : slugValidation.valid === false ? (
                    <p className="text-xs text-red-600">✗ {slugValidation.message || "Slug no disponible"}</p>
                  ) : null}
                </div>
              )}
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
              {/* Indicador de validación de email */}
              {form.email && form.email.trim().length > 0 && emailValid !== null && (
                <div className="mt-1">
                  {emailValid ? (
                    <p className="text-xs text-green-600">✓ Email válido</p>
                  ) : (
                    <p className="text-xs text-red-600">✗ Email inválido</p>
                  )}
                </div>
              )}
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

            <div>
              <Label className="text-sm text-accent-foreground">Dirección</Label>
              <Input
                className="mt-1 w-full"
                value={form.address ?? ""}
                onChange={(e) =>
                  updateField("address" as keyof Group, e.target.value)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Identificador (NIT/Registro)</Label>
              <Input
                className="mt-1 w-full"
                value={(form as any).identifierNumber ?? ""}
                onChange={(e) =>
                  updateField("identifierNumber" as keyof Group, e.target.value as any)
                }
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md border border-slate-200 mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Identidad del grupo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-accent-foreground">Lema (motto)</Label>
              <Input
                className="mt-1 w-full"
                value={(form as any).motto ?? ""}
                onChange={(e) =>
                  updateField("motto" as keyof Group, e.target.value as any)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Fecha de fundación</Label>
              <Input
                type="date"
                className="mt-1 w-full"
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                value={(form as any).foundedIn ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const year = new Date(value).getFullYear();
                    if (year >= 1900 && year <= new Date().getFullYear()) {
                      updateField("foundedIn" as keyof Group, value as any);
                    }
                  } else {
                    updateField("foundedIn" as keyof Group, value as any);
                  }
                }}
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Misión</Label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={(form as any).mission ?? ""}
                onChange={(e) =>
                  updateField("mission" as keyof Group, e.target.value as any)
                }
              />
            </div>

            <div>
              <Label className="text-sm text-accent-foreground">Visión</Label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={(form as any).vision ?? ""}
                onChange={(e) =>
                  updateField("vision" as keyof Group, e.target.value as any)
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm text-accent-foreground">Historia</Label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={4}
                value={(form as any).history ?? ""}
                onChange={(e) =>
                  updateField("history" as keyof Group, e.target.value as any)
                }
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md border border-slate-200 mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Estado</h3>
          <div>
            <Label className="text-sm text-accent-foreground">Estado</Label>
            <select
              className="mt-1 w-full border rounded h-10 px-3 text-sm bg-white"
              value={(form.status as string) ?? (form.isActive ? "ACTIVE" : "INACTIVE")}
              onChange={(e) => updateField("status" as keyof Group, e.target.value as any)}
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md border border-slate-200 mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Imagen del grupo (opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-accent-foreground">Selecciona una imagen</Label>
              <div className="mt-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-gray-500">Click para seleccionar imagen</p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP (máx. 5MB)</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageError(null);
                      setImagePreview(null);
                      
                      if (file) {
                        // Validar tipo de archivo
                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!validTypes.includes(file.type)) {
                          setImageError('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
                          setImageFile(null);
                          return;
                        }
                        
                        // Validar tamaño (máximo 5MB)
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        if (file.size > maxSize) {
                          setImageError('La imagen es demasiado grande. Máximo 5MB');
                          setImageFile(null);
                          return;
                        }
                        
                        setImageFile(file);
                        
                        // Crear preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setImageFile(null);
                      }
                    }}
                  />
                </label>
              </div>
              {imageFile && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {imageError && (
                <p className="text-xs text-red-600 mt-2">✗ {imageError}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-accent-foreground">Vista previa</Label>
              <div className="mt-1 w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-gray-400">No hay imagen seleccionada</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md border border-slate-200 mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Redes Sociales (opcional)</h3>
          <SocialLinksInput
            value={socialLinks}
            onChange={setSocialLinks}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Heart,
  Eye,
  History,
  Camera,
  Link,
  CalendarDays,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  updateGroupSchema,
  type UpdateGroupFormData,
} from "@/schemas/group.schema";
import { useTenantParams } from "@/app/routes/organigrama/organigramaRamas_Subramas/hooks/useTenantParams";
import { getGroupsByTenant } from "@/api/organigramaApi";
import { updateGroup, updateGroupLogo, updateGroupScarf } from "@/api/groupsApi";
import FullScreenLoader from "@/components/common/FullScreenLoader";
import { uploadPhotoFile } from "@/lib/imageUtils";

// Tipos
interface GroupData {
  slug: string;
  name: string;
  district?: string;
  identifier_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  founded_in?: string;
  motto?: string;
  mission?: string;
  vision?: string;
  history?: string;
  logo_object_url?: string;
  scarf_object_url?: string;
  social_links?: Record<string, string>;
  config?: Record<string, unknown>;
  is_active?: boolean;
  status?: string;
}

// Utilidades de mapeo
const mapGroupDataToForm = (
  groupData: Partial<GroupData>
): UpdateGroupFormData => ({
  name: groupData.name || "",
  district: groupData.district || "",
  address: groupData.address || "",
  phone: groupData.phone || "",
  email: groupData.email || "",
  founded_in: groupData.founded_in || "",
  motto: groupData.motto || "",
  mission: groupData.mission || "",
  vision: groupData.vision || "",
  history: groupData.history || "",
  logo: groupData.logo_object_url || "",
  scarf: groupData.scarf_object_url || "",
  social_links: {
    instagram: groupData.social_links?.instagram || "",
    facebook: groupData.social_links?.facebook || "",
    website: groupData.social_links?.website || "",
  },
});

const mapFormDataToUpdate = (
  formData: UpdateGroupFormData,
  originalData?: GroupData
) => ({
  slug: originalData?.slug || "",
  name: formData.name,
  district: formData.district || "",
  identifier_number: originalData?.identifier_number || "",
  address: formData.address || "",
  phone: formData.phone || "",
  email: formData.email || "",
  founded_in: formData.founded_in || "",
  motto: formData.motto || "",
  mission: formData.mission || "",
  vision: formData.vision || "",
  history: formData.history || "",
  logo_object_id: formData.logo || undefined,
  scarf_object_id: formData.scarf || undefined,
  social_links: formData.social_links || {},
  config: originalData?.config || {},
  is_active: originalData?.is_active ?? true,
  status: originalData?.status || "ACTIVE",
});

// Parse a YYYY-MM-DD string into a local Date (avoid UTC parsing issues)
const parseYMDToDate = (s?: string) => {
  if (!s) return undefined;
  const parts = s.split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined;
  return new Date(y, m - 1, d);
};

function Grupos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalGroupData, setOriginalGroupData] = useState<GroupData | null>(
    null
  );
  const [logoChanged, setLogoChanged] = useState(false);
  const [scarfChanged, setScarfChanged] = useState(false);
  const { tenantId, groupSlug } = useTenantParams();

  const form = useForm<UpdateGroupFormData>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      name: "",
      district: "",
      address: "",
      phone: "",
      email: "",
      founded_in: "",
      motto: "",
      mission: "",
      vision: "",
      history: "",
      logo: "",
      scarf: "",
      social_links: {
        instagram: "",
        facebook: "",
        website: "",
      },
    },
  });

  const loadGroupData = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const groups = await getGroupsByTenant(tenantId);

      if (groups && groups.length > 0) {
        const group = groups[0];
        setOriginalGroupData(group as GroupData);
        const formData = mapGroupDataToForm(group as Partial<GroupData>);
        form.reset(formData);
      }
    } catch (error) {
      console.error("Error cargando datos del grupo:", error);
      toast.error("Error al cargar los datos del grupo");
    } finally {
      setLoading(false);
    }
  }, [tenantId, form]);

  const handleSubmit = async (data: UpdateGroupFormData) => {
    if (!tenantId || !groupSlug) {
      toast.error("No se pudo identificar el grupo a actualizar");
      return;
    }

    try {
      setSaving(true);
      const updateData = mapFormDataToUpdate(
        data,
        originalGroupData || undefined
      );

      await updateGroup(tenantId, groupSlug, updateData);

      // Actualizar logo si cambió
      if (logoChanged && data.logo) {
        try {
          await updateGroupLogo(tenantId, groupSlug, data.logo);
          toast.success("Logo actualizado correctamente");
        } catch (error) {
          console.error("Error actualizando logo:", error);
          toast.error("Error al actualizar el logo");
        }
      }

      // Actualizar scarf si cambió
      if (scarfChanged && data.scarf) {
        try {
          await updateGroupScarf(tenantId, groupSlug, data.scarf);
          toast.success("Pañoleta actualizada correctamente");
        } catch (error) {
          console.error("Error actualizando pañoleta:", error);
          toast.error("Error al actualizar la pañoleta");
        }
      }

      toast.success("Información del grupo actualizada exitosamente");
      setLogoChanged(false);
      setScarfChanged(false);

      await loadGroupData();
    } catch (error) {
      console.error("Error actualizando grupo:", error);
      toast.error("Error al actualizar la información del grupo");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadGroupData();
  }, [loadGroupData]);

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center space-x-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Información del Grupo Scout
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información principal de tu grupo scout
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
              <CardDescription>
                Datos principales del grupo scout
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nombre del Grupo *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="founded_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fundación</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild className="bg-white">
                          <Button
                            variant="outline"
                            className={`w-full justify-between text-left ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            <span>
                              {field.value
                                ? parseYMDToDate(
                                    field.value
                                  )?.toLocaleDateString() || "Selecciona una fecha"
                                : "Selecciona una fecha"}
                            </span>
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            selected={
                              field.value
                                ? parseYMDToDate(field.value)
                                : undefined
                            }
                            onSelect={(date) => {
                              const value = date
                                ? date.toISOString().split("T")[0]
                                : "";
                              field.onChange(value);
                            }}
                            disabled={(date) => date > new Date()}
                            defaultMonth={field.value ? parseYMDToDate(field.value) : undefined}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Información de Contacto</span>
              </CardTitle>
              <CardDescription>
                Datos de contacto y ubicación del grupo
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Teléfono</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Identidad del Grupo</span>
              </CardTitle>
              <CardDescription>
                Misión, visión, historia y elementos distintivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="motto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lema</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Misión</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        className="resize-none bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Visión</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        className="resize-none bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <History className="h-4 w-4" />
                      <span>Historia</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        className="resize-none bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Elementos Visuales</span>
              </CardTitle>
              <CardDescription>
                Logo, pañoleta y elementos gráficos distintivos
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Logo del grupo"
                        value={field.value}
                        onChange={(objectId) => {
                          field.onChange(objectId);
                          setLogoChanged(true);
                        }}
                        onUpload={uploadPhotoFile}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scarf"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        label="Pañoleta del grupo"
                        value={field.value}
                        onChange={(objectId) => {
                          field.onChange(objectId);
                          setScarfChanged(true);
                        }}
                        onUpload={uploadPhotoFile}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Enlaces Sociales</span>
              </CardTitle>
              <CardDescription>
                Redes sociales y sitios web del grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="social_links.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_links.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_links.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} variant="primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default Grupos;

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateMemberByDtoAction } from "@/store/members/membersActions";
import { fetchGroupsWithAdminsAction } from "@/store/groups/groupsActions";
import { useMember } from "@/hooks/useMember";

interface AdminData {
  member_id: number;
  first_name: string;
  last_name: string;
  identification: string;
  document_type: string | null;
  birth_date: string | null;
  address: string | null;
  phone: string | null;
  gender: string | null;
  weight: string | number | null;
  height: string | number | null;
  email: string | null;
  full_name: string;
}

interface EditAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminData | null;
  groupName: string;
}

export default function EditAdminModal({
  open,
  onOpenChange,
  admin,
  groupName,
}: EditAdminModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useMember();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    identification: "",
    birthDate: "",
    address: "",
    phone: "",
    gender: "",
    weight: "",
    height: "",
    email: "",
  });

  useEffect(() => {
    if (admin && open) {
      setFormData({
        firstName: admin.first_name || "",
        lastName: admin.last_name || "",
        documentType: admin.document_type || "CC",
        identification: admin.identification || "",
        birthDate: admin.birth_date || "",
        address: admin.address || "",
        phone: admin.phone || "",
        gender: admin.gender || "",
        weight: admin.weight ? String(admin.weight) : "",
        height: admin.height ? String(admin.height) : "",
        email: admin.email || "",
      });
      setErrors({});
    }
  }, [admin, open]);

  const parseISOToLocalDate = (iso?: string): Date | undefined => {
    if (!iso) return undefined;
    const parts = String(iso)
      .split("-")
      .map((p) => Number(p));
    if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Los apellidos son requeridos";
    }
    if (!formData.identification.trim()) {
      newErrors.identification = "El número de documento es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => onOpenChange(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor completa todos los campos correctamente");
      return;
    }

    if (!admin) {
      toast.error("No se ha seleccionado un administrador");
      return;
    }

    try {
      const updateDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentType: formData.documentType,
        identification: formData.identification,
        birthDate: formData.birthDate || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        // Email no se envía porque no se puede modificar (está en Auth0)
      };

      const result = await dispatch(
        updateMemberByDtoAction({
          uid: String(admin.member_id),
          memberDto: updateDto,
        })
      );

      if (updateMemberByDtoAction.fulfilled.match(result)) {
        toast.success("Administrador actualizado exitosamente");
        await dispatch(fetchGroupsWithAdminsAction());
        onOpenChange(false);
      } else {
        toast.error("Error al actualizar el administrador");
      }
    } catch (error: unknown) {
      console.error("Error al actualizar administrador:", error);
      toast.error("Error inesperado al actualizar el administrador");
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Administrador de Grupo
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Editando administrador del grupo <strong>{groupName}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Label>Apellidos *</Label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm">{errors.lastName}</p>
              )}
            </div>

            <div>
              <Label>Tipo documento</Label>
              <Input
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label>Número de documento *</Label>
              <Input
                name="identification"
                value={formData.identification}
                onChange={handleChange}
                className="mt-1 w-full"
              />
              {errors.identification && (
                <p className="text-red-600 text-sm">{errors.identification}</p>
              )}
            </div>

            <div>
              <Label>Correo</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="mt-1 w-full bg-gray-100 cursor-not-allowed text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ El email no se puede modificar porque está vinculado a Auth0
              </p>
            </div>

            <div>
              <Label>Teléfono</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label>Fecha de nacimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`mt-1 w-full bg-white pl-3 text-left font-normal ${
                      !formData.birthDate ? "text-muted-foreground" : ""
                    }`}
                  >
                    {formData.birthDate ? (
                      (() => {
                        const dt = parseISOToLocalDate(formData.birthDate);
                        return dt ? (
                          format(dt, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        );
                      })()
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.birthDate
                        ? parseISOToLocalDate(formData.birthDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        birthDate: date ? format(date, "yyyy-MM-dd") : "",
                      }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Género</Label>
              <Select
                value={formData.gender}
                onValueChange={(v: string) =>
                  setFormData((prev) => ({ ...prev, gender: v }))
                }
              >
                <SelectTrigger className="w-full mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label>Peso (kg)</Label>
              <Input
                name="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label>Altura (cm)</Label>
              <Input
                name="height"
                type="number"
                step="0.01"
                value={formData.height}
                onChange={handleChange}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

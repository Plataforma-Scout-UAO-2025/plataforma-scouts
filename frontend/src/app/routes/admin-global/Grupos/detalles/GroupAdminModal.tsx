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
import type { Gender } from "@/types/enrollment.type";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { createGroupAdminWithConnectionAction, fetchGroupsWithAdminsAction } from "@/store/groups/groupsActions";
import { useGroup } from "@/hooks/useGroup";

interface PersonalData {
  firstname: string;
  lastname: string;
  email: string;
  confirm_email: string;
  username: string;
  password: string;
  confirm_password: string;
  document_type: string;
  identification: string;
  birth_date: string;
  address: string;
  phone: string;
  gender: string;
  weight: string;
  height: string;
}

interface GroupAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

export default function GroupAdminModal({
  open,
  onOpenChange,
  group,
}: GroupAdminModalProps) {
  const dispatch = useAppDispatch();
  const { loading: loadingSubmit } = useGroup();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datosPersonales, setDatosPersonales] = useState<PersonalData>({
    firstname: "",
    lastname: "",
    email: "",
    confirm_email: "",
    username: "",
    password: "",
    confirm_password: "",
    document_type: "",
    identification: "",
    birth_date: "",
    address: "",
    phone: "",
    gender: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setDatosPersonales({
        firstname: "",
        lastname: "",
        email: "",
        confirm_email: "",
        username: "",
        password: "",
        confirm_password: "",
        document_type: "",
        identification: "",
        birth_date: "",
        address: "",
        phone: "",
        gender: "",
        weight: "",
        height: "",
      });
      setErrors({});
    }
  }, [open]);

  const parseISOToLocalDate = (iso?: string | undefined): Date | undefined => {
    if (!iso) return undefined;
    const parts = String(iso)
      .split("-")
      .map((p) => Number(p));
    if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosPersonales((prev) => ({ ...prev, [name]: value }));
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

    if (!datosPersonales.firstname.trim()) {
      newErrors.firstname = "El nombre es requerido";
    }
    if (!datosPersonales.lastname.trim()) {
      newErrors.lastname = "Los apellidos son requeridos";
    }
    if (!datosPersonales.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(datosPersonales.email)) {
      newErrors.email = "El correo no es válido";
    }
    if (datosPersonales.email !== datosPersonales.confirm_email) {
      newErrors.confirm_email = "Los correos no coinciden";
    }
    if (!datosPersonales.username.trim()) {
      newErrors.username = "El usuario es requerido";
    }
    if (!datosPersonales.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (datosPersonales.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_-])/.test(datosPersonales.password)) {
      newErrors.password = "Debe contener mayúsculas, minúsculas, números y símbolos (@$!%*?&#_-)";
    }
    if (datosPersonales.password !== datosPersonales.confirm_password) {
      newErrors.confirm_password = "Las contraseñas no coinciden";
    }
    if (!datosPersonales.identification.trim()) {
      newErrors.identification = "El número de documento es requerido";
    }
    if (!datosPersonales.birth_date) {
      newErrors.birth_date = "La fecha de nacimiento es requerida";
    }
    if (!datosPersonales.gender) {
      newErrors.gender = "El género es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => onOpenChange(false);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor completa todos los campos correctamente");
      return;
    }

    if (!group) {
      toast.error("No se ha seleccionado un grupo");
      return;
    }

    try {
      // Preparar el DTO del miembro según CreateMemberDTO del backend (usa snake_case)
      const memberDto = {
        first_name: datosPersonales.firstname,
        last_name: datosPersonales.lastname,
        document_type: datosPersonales.document_type || "CC",
        identification: datosPersonales.identification,
        birth_date: datosPersonales.birth_date,
        address: datosPersonales.address,
        phone: datosPersonales.phone,
        gender: datosPersonales.gender,
        weight: datosPersonales.weight || undefined,
        height: datosPersonales.height || undefined,
        email: datosPersonales.email,
        role: "ADMIN_GRUPO",
        is_active: true,
        accept_treatment: true, // Requerido por la base de datos
      };

      const payload = {
        tenantId: group.tenant_id,
        slug: group.slug,
        data: {
          email: datosPersonales.email,
          password: datosPersonales.password,
          username: datosPersonales.username,
          member: memberDto,
        },
      };


      // Llamar a la acción de Redux para crear administrador de grupo con la conexión correcta
      const result = await dispatch(createGroupAdminWithConnectionAction(payload));

      if (createGroupAdminWithConnectionAction.fulfilled.match(result)) {
        toast.success("Administrador de grupo creado exitosamente en la conexión correcta");
        
        // Refrescar la lista de grupos
        await dispatch(fetchGroupsWithAdminsAction());
        
        onOpenChange(false);
      } else {
        console.error("Error del backend:", result.payload);
        const errorMessage = result.payload?.error || "Error al crear el administrador de grupo";
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Error inesperado al crear administrador de grupo:", error);
      toast.error("Error inesperado al crear el administrador de grupo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Crear Administrador de Grupo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onCreate} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Asignar o crear un administrador para el grupo{" "}
            <strong>{group?.name ?? "(Selecciona un grupo)"}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                name="firstname"
                value={datosPersonales.firstname}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.firstname && (
                <p className="text-red-600 text-sm">{errors.firstname}</p>
              )}
            </div>

            <div>
              <Label>Apellidos</Label>
              <Input
                name="lastname"
                value={datosPersonales.lastname}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.lastname && (
                <p className="text-red-600 text-sm">{errors.lastname}</p>
              )}
            </div>

            <div>
              <Label>Correo</Label>
              <Input
                name="email"
                type="email"
                value={datosPersonales.email}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <Label>Confirmar correo</Label>
              <Input
                name="confirm_email"
                type="email"
                value={datosPersonales.confirm_email}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.confirm_email && (
                <p className="text-red-600 text-sm">{errors.confirm_email}</p>
              )}
            </div>

            <div>
              <Label>Usuario</Label>
              <Input
                name="username"
                value={datosPersonales.username}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.username && (
                <p className="text-red-600 text-sm">{errors.username}</p>
              )}
            </div>

            <div>
              <Label>Contraseña</Label>
              <Input
                name="password"
                type="password"
                value={datosPersonales.password}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
                placeholder="Ej: Admin@123"
              />
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&#_-)
              </p>
            </div>

            <div>
              <Label>Confirmar contraseña</Label>
              <Input
                name="confirm_password"
                type="password"
                value={datosPersonales.confirm_password}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.confirm_password && (
                <p className="text-red-600 text-sm">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            <div>
              <Label>Tipo documento</Label>
              <Input
                name="document_type"
                value={datosPersonales.document_type}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.document_type && (
                <p className="text-red-600 text-sm">{errors.document_type}</p>
              )}
            </div>

            <div>
              <Label>Número de documento</Label>
              <Input
                name="identification"
                value={datosPersonales.identification}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.identification && (
                <p className="text-red-600 text-sm">{errors.identification}</p>
              )}
            </div>

            <div>
              <Label>Fecha de nacimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`mt-1 w-full bg-white pl-3 text-left font-normal ${
                      !datosPersonales.birth_date ? "text-muted-foreground" : ""
                    }`}
                  >
                    {datosPersonales.birth_date ? (
                      (() => {
                        const dt = parseISOToLocalDate(
                          datosPersonales.birth_date
                        );
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
                      datosPersonales.birth_date
                        ? parseISOToLocalDate(datosPersonales.birth_date)
                        : undefined
                    }
                    onSelect={(date) =>
                      setDatosPersonales((prev) => ({
                        ...prev,
                        birth_date: date ? format(date, "yyyy-MM-dd") : "",
                      }))
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.birth_date && (
                <p className="text-red-600 text-sm">{errors.birth_date}</p>
              )}
            </div>

            <div>
              <Label>Género</Label>
              <Select
                value={datosPersonales.gender}
                onValueChange={(v: string) =>
                  setDatosPersonales((prev) => ({
                    ...prev,
                    gender: v as Gender,
                  }))
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
              {errors.gender && (
                <p className="text-red-600 text-sm">{errors.gender}</p>
              )}
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                name="address"
                value={datosPersonales.address}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.address && (
                <p className="text-red-600 text-sm">{errors.address}</p>
              )}
            </div>

            <div>
              <Label>Teléfono</Label>
              <Input
                name="phone"
                value={datosPersonales.phone}
                onChange={handlePersonalChange}
                className="mt-1 w-full"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? "Creando..." : "Crear administrador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

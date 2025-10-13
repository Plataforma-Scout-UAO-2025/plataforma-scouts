import { useForm } from "react-hook-form";
import {
  createCuotaFormSchema,
  type CreateCuotaFormValues,
} from "../schemas/CreateCuotaForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, Separator } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast, type ExternalToast } from "sonner";
import api from "@/api/axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import type { Subgroup } from "@/types/subgroup.type";
import type { Section } from "@/types/section.type";
import type { Member } from "@/types/member.type";
import { useTenant } from "@/hooks/useTenant";

interface CreateCuotaFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: Partial<CreateCuotaFormValues>;
  submitButtonText?: string;
  cuotaId?: string; // ID para edición
  isEditMode?: boolean; // Nueva prop para indicar si es modo edición
  onRefresh?: () => void; // Nueva prop para refrescar la lista
}

export default function CreateCuotaForm({
  setOpen,
  defaultValues,
  submitButtonText = "Crear cuota",
  cuotaId,
  isEditMode = false,
  onRefresh,
}: CreateCuotaFormProps) {
  const tenantId = useTenant();
  const navigate = useNavigate();

  const [showAssociatedToField, setShowAssociatedToField] = useState(false);
  // Traer los miembros, subgrupos y secciones del grupo
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembersSubgroupsAndSections = async () => {
      // Cargar miembros
      try {
        const membersResponse = await api.get(`finanzas/fees/members/${tenantId}`);
        setMembers(membersResponse.data || []);
      } catch (error) {
        console.error("Error al cargar miembros:", error);
        toast.error("Error al cargar miembros del grupo");
      }

      // Cargar subgrupos
      try {
        const subgroupsResponse = await api.get(`finanzas/fees/subgroups/${tenantId}`);
        setSubgroups(subgroupsResponse.data || []);
      } catch (error) {
        console.error("Error al cargar subgrupos:", error);
        toast.error("Error al cargar subgrupos del grupo");
      }

      // Cargar secciones
      try {
        const sectionsResponse = await api.get(`finanzas/fees/sections/${tenantId}`);
        setSections(sectionsResponse.data || []);
      } catch (error) {
        console.error("Error al cargar secciones:", error);
        toast.error("Error al cargar secciones del grupo");
      }
    };
    fetchMembersSubgroupsAndSections();
  }, [tenantId]);

  
  
  const form = useForm<CreateCuotaFormValues>({
    resolver: zodResolver(createCuotaFormSchema(isEditMode)),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      periodicity: defaultValues?.periodicity || "MONTH",
      scope: defaultValues?.scope || "ALL",
      start_date: defaultValues?.start_date
        ? typeof defaultValues.start_date === "string"
          ? new Date(defaultValues.start_date)
          : defaultValues.start_date
        : new Date(),
      end_date: defaultValues?.end_date
        ? typeof defaultValues.end_date === "string"
          ? new Date(defaultValues.end_date)
          : defaultValues.end_date
        : defaultValues?.periodicity === "SINGLE" ? undefined : undefined,
      associated_to: defaultValues?.associated_to || null,
    },
  });

  const scopeValue = form.watch("scope");
  const periodicityValue = form.watch("periodicity");

  // Mostrar campo target_member_id solo cuando scope es SCOUT
  useEffect(() => {
    // Resetear el campo associated_to cada vez que cambia el scope
    if (scopeValue === "ALL") {
      // Cuando el scope es ALL, associated_to debe ser null
      form.setValue("associated_to", null);
    } else {
      // Para otros scopes, resetear a valores vacíos
      form.setValue("associated_to", { id: "", name: "" });
    }

    // Limpiar valores de campos que no corresponden al scope actual
    if (scopeValue !== "SCOUT" && scopeValue !== "SUBGROUP" && scopeValue !== "SECTION") {
      setShowAssociatedToField(false);
    } else {
      setShowAssociatedToField(true);
    }
  }, [scopeValue, form]);

  // Cuando cambia la periodicidad a SINGLE, limpiar end_date
  useEffect(() => {
    if (periodicityValue === "SINGLE") {
      form.resetField("end_date");
    }
  }, [periodicityValue, form]);

  async function onSubmit(values: CreateCuotaFormValues) {
    // Preparar los datos según el formato esperado por el backend
    const dataToSendCreate = {
      tenant_id: tenantId,
      name: values.name,
      description: values.description,
      amount: values.amount,
      periodicity: values.periodicity,
      scope: values.scope,
      start_date: values.start_date.toISOString().split('T')[0], // Formato YYYY-MM-DD
      // Si es SINGLE, usar la misma fecha de inicio como fecha de fin
      ...(values.periodicity === "SINGLE"
        ? { end_date: values.start_date.toISOString().split('T')[0] }
        : values.end_date && { end_date: values.end_date.toISOString().split('T')[0] }
      ),
      associated_to: values.scope === "ALL" ? null : values.associated_to,
    };


    if (isEditMode && cuotaId) {
      // Modo edición: incluir el ID de la cuota
      try {
        const dataToSendEdit = {
          name: values.name,
          description: values.description,
          amount: values.amount,
        };

        const response = await api.patch(
          `${import.meta.env.VITE_BACKEND_URL}finanzas/fees/${tenantId}/${cuotaId}`,
          dataToSendEdit
        );

        if (response.status === 200) {
          toast.success("Cuota actualizada correctamente");
          setOpen(false);
          onRefresh?.();
        } else if (response.status === 401) {
          toast.error("No tienes permisos para realizar esta acción");
          navigate("/app/dashboard");
        } else {
          toast.error("Error al actualizar la cuota:", response.data.message);
        }
      } catch (error) {
        toast.error("Error al actualizar la cuota:", error as ExternalToast);
        console.error("Error al actualizar la cuota:", error);
      }
    } else {
      // Modo creación: crear nueva cuota
      try {
        const response = await api.post(
          `${import.meta.env.VITE_BACKEND_URL}finanzas/fees`,
          dataToSendCreate
        );

        if (response.status === 201) {
          toast.success("Cuota creada correctamente");
          setOpen(false);
          onRefresh?.();
        } else if (response.status === 401) {
          toast.error("No tienes permisos para realizar esta acción");
          navigate("/app/dashboard");
        } else {
          toast.error("Error al crear la cuota:", response.data.message);
        }
      } catch (error) {
        toast.error("Error al crear la cuota:", error as ExternalToast);
        console.error("Error al crear la cuota:", error);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-3 gap-6"
      >
        <div className="col-span-full md:col-span-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Cuota estándar lobatos..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-full">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción detallada de la cuota..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12300"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-2">
          <FormField
            control={form.control}
            name="periodicity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periodicidad</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una periodicidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Única</SelectItem>
                      <SelectItem value="MONTH">Mensual</SelectItem>
                      <SelectItem value="QUARTER">Trimestral</SelectItem>
                      <SelectItem value="YEAR">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isEditMode}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {periodicityValue !== "SINGLE" && (
          <div className="col-span-full md:col-span-1">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isEditMode}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <Separator className="col-span-full" />

        <div className="col-span-full md:col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alcance</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un alcance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="SCOUT">Scout específico</SelectItem>
                      <SelectItem value="SUBGROUP">Subgrupo</SelectItem>
                      <SelectItem value="SECTION">Sección</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {(showAssociatedToField || isEditMode) && (
            <FormField
              control={form.control}
              name="associated_to"
              render={({ field }) => {
                // En modo edición, mostrar input readonly siempre
                if (isEditMode) {
                  const displayValue = defaultValues?.associated_to?.name ||
                    (scopeValue === "ALL" ? "Todos los miembros" :
                     scopeValue === "SCOUT" ? "Scout específico" :
                     scopeValue === "SUBGROUP" ? "Subgrupo" :
                     scopeValue === "SECTION" ? "Sección" : "No especificado");

                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Asociado</FormLabel>
                      <FormControl>
                        <Input
                          value={displayValue}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }

                // En modo creación, mostrar select
                const handleValueChange = (value: string) => {
                  if (scopeValue === "SCOUT") {
                    const member = members.find(m => m.member_id?.toString() === value);
                    if (member && member.member_id) {
                      field.onChange({ id: member.member_id.toString(), name: `${member.first_name} ${member.last_name}` });
                    }
                  } else if (scopeValue === "SUBGROUP") {
                    const subgroup = subgroups.find(s => s.id.toString() === value);
                    if (subgroup) {
                      field.onChange({ id: subgroup.id.toString(), name: subgroup.name });
                    }
                  } else if (scopeValue === "SECTION") {
                    const section = sections.find(s => s.id.toString() === value);
                    if (section) {
                      field.onChange({ id: section.id.toString(), name: section.name });
                    }
                  }
                };

                const getPlaceholder = () => {
                  switch (scopeValue) {
                    case "SCOUT": return "Selecciona un scout...";
                    case "SUBGROUP": return "Selecciona un subgrupo...";
                    case "SECTION": return "Selecciona una sección...";
                    default: return "Selecciona un asociado...";
                  }
                };

                return (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Seleccionar asociado</FormLabel>
                    <Select
                      onValueChange={handleValueChange}
                      value={field.value?.id || ""}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full col-span-full">
                          <SelectValue placeholder={getPlaceholder()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scopeValue === "SCOUT" && members
                          .filter(member => member.member_id !== undefined)
                          .map((member) => (
                          <SelectItem
                            key={member.member_id}
                            value={member.member_id!.toString()}
                          >
                            {member.member_id} - {member.first_name} {member.last_name}
                          </SelectItem>
                        ))}
                        {scopeValue === "SUBGROUP" && subgroups.map((subgroup) => (
                          <SelectItem
                            key={subgroup.id}
                            value={subgroup.id.toString()}
                          >
                            {subgroup.id} - {subgroup.name}
                          </SelectItem>
                        ))}
                        {scopeValue === "SECTION" && sections.map((section) => (
                          <SelectItem
                            key={section.id}
                            value={section.id.toString()}
                          >
                            {section.id} - {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}        
        </div>

        <div className="col-span-full flex justify-end mt-4 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

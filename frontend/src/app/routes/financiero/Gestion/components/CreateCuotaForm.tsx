import { useForm } from "react-hook-form";
import {
  CreateCuotaFormSchema,
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
import { cn } from "@/lib/utils";
import { toast, type ExternalToast } from "sonner";
import axios from "axios";
import type { MemberPaymentDto } from "@/types/pago.type";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

// Datos mockeados de scouts
const mockScouts: MemberPaymentDto[] = [
  {
    member_id: 1,
    tenant_id: 1,
    first_name: "Juan",
    last_name: "Pérez",
    subgroup: "Lobatos",
    age: 12,
  },
  {
    member_id: 2,
    tenant_id: 1,
    first_name: "María",
    last_name: "García",
    subgroup: "Lobatos",
    age: 11,
  },
  {
    member_id: 3,
    tenant_id: 1,
    first_name: "Carlos",
    last_name: "Rodríguez",
    subgroup: "Scouts",
    age: 14,
  },
  {
    member_id: 4,
    tenant_id: 1,
    first_name: "Ana",
    last_name: "López",
    subgroup: "Scouts",
    age: 13,
  },
  {
    member_id: 5,
    tenant_id: 1,
    first_name: "Pedro",
    last_name: "Martínez",
    subgroup: "Rovers",
    age: 16,
  },
];

interface CreateCuotaFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: Partial<CreateCuotaFormValues>;
  submitButtonText?: string;
  cuotaId?: string; // ID para edición
}

export default function CreateCuotaForm({
  setOpen,
  defaultValues,
  submitButtonText = "Crear cuota",
  cuotaId,
}: CreateCuotaFormProps) {
  const [showTargetMemberField, setShowTargetMemberField] = useState(false);
  const [scouts, setScouts] = useState<MemberPaymentDto[]>([]);

  const form = useForm<CreateCuotaFormValues>({
    resolver: zodResolver(CreateCuotaFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      periodicity: defaultValues?.periodicity || "MONTH",
      scope: defaultValues?.scope || "ALL",
      start_date: defaultValues?.start_date
        ? (typeof defaultValues.start_date === 'string'
           ? new Date(defaultValues.start_date)
           : defaultValues.start_date)
        : new Date(),
      end_date: defaultValues?.end_date
        ? (typeof defaultValues.end_date === 'string'
           ? new Date(defaultValues.end_date)
           : defaultValues.end_date)
        : undefined,
      target_member_id: defaultValues?.target_member_id,
    },
  });

  const scopeValue = form.watch("scope");

  // Mostrar campo target_member_id solo cuando scope es SCOUT
  useEffect(() => {
    setShowTargetMemberField(scopeValue === "SCOUT");
  }, [scopeValue]);

  // Cargar scouts mockeados
  useEffect(() => {
    setScouts(mockScouts);
  }, []);

  async function onSubmit(values: CreateCuotaFormValues) {
    // Preparar los datos según el formato esperado por el backend
    const dataToSend = {
      name: values.name,
      description: values.description,
      amount: values.amount,
      periodicity: values.periodicity,
      scope: values.scope,
      start_date: values.start_date.toISOString(),
      ...(values.end_date && { end_date: values.end_date.toISOString() }),
      ...(values.scope === "SCOUT" &&
        values.target_member_id && {
          target_member_id: values.target_member_id,
        }),
    };

    if (cuotaId) {
      // Modo edición: incluir el ID de la cuota
      try {
        const response = await axios.put(
          import.meta.env.VITE_BACKEND_URL + "finanzas/cuotas/" + cuotaId,
          dataToSend
        );

        if (response.status === 200) {
          toast.success("Cuota actualizada correctamente");
          setOpen(false);
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
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "finanzas/cuotas",
          dataToSend
        );

        if (response.status === 201) {
          toast.success("Cuota creada correctamente");
          setOpen(false);
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
                      >
                        {field.value ? (
                          format(field.value, "PPP")
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
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de fin (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
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
          {showTargetMemberField && (
            <FormField
              control={form.control}
              name="target_member_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Seleccionar Scout</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full col-span-full">
                        <SelectValue placeholder="Selecciona un scout..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scouts.map((scout) => (
                        <SelectItem
                          key={scout.member_id}
                          value={scout.member_id.toString()}
                        >
                          {scout.member_id} - {scout.first_name}{" "}
                          {scout.last_name} ({scout.subgroup}, {scout.age} años)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
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

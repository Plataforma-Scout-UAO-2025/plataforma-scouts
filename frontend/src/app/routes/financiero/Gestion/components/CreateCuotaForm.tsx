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
import { Button } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, type ExternalToast } from "sonner";
import axios from "axios";

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
  const form = useForm<CreateCuotaFormValues>({
    resolver: zodResolver(CreateCuotaFormSchema),
    defaultValues: {
      nombre: defaultValues?.nombre || "",
      monto: defaultValues?.monto || "0",
      periodicidad:
        (defaultValues?.periodicidad as
          | "Mensual"
          | "Trimestral"
          | "Semestral"
          | "Anual") || "Mensual",
      tipoCuota:
        (defaultValues?.tipoCuota as "Ordinaria" | "Extraordinaria") ||
        "Ordinaria",
      fechaLimitePago: defaultValues?.fechaLimitePago || "",
      medioPago:
        (defaultValues?.medioPago as
          | "PSE"
          | "Efectivo"
          | "Tarjeta de Debito"
          | "Tarjeta de Credito"
          | "Otro") || "PSE",
      aplicaA: defaultValues?.aplicaA || "",
    },
  });

  async function onSubmit(values: CreateCuotaFormValues) {
    if (cuotaId) {
      // Modo edición: incluir el ID de la cuota
      try {

        const data = {
          id: cuotaId,
          ...values,
        }

        const response = await axios.put(
          import.meta.env.VITE_BACKEND_URL + "finanzas/cuotas/" + cuotaId,
          data
        );

        if (response.status === 200) {
          toast.success("Cuota actualizada correctamente");
          // window.location.reload();
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
          values
        );

        if(response.status === 201) {
          toast.success("Cuota creada correctamente");
          // window.location.reload();
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
        <div className="col-span-12 md:col-span-1">
          <FormField
            control={form.control}
            name="nombre"
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
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="12300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="periodicidad"
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
                      <SelectItem value="Mensual">Mensual</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
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
            name="fechaLimitePago"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha límite de pago</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="28 de cada mes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="tipoCuota"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de cuota</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecciona un tipo de cuota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                      <SelectItem value="Extraordinaria">
                        Extraordinaria
                      </SelectItem>
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
            name="medioPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medio de pago</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un medio de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PSE">PSE</SelectItem>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta de Debito">
                        Tarjeta de Debito
                      </SelectItem>
                      <SelectItem value="Tarjeta de Credito">
                        Tarjeta de Credito
                      </SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full">
          <FormField
            control={form.control}
            name="aplicaA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aplica a</FormLabel>
                <FormControl>
                  <Input placeholder="Lobatos..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

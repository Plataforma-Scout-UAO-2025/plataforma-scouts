import { useForm } from "react-hook-form";
import {
  CreatePagoFormSchema,
  type CreatePagoFormValues,
} from "../schemas/CreatePagoForm.schema";
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
import { mockScouts, mockCuotas } from "../constants/mockData";

interface CreatePagoFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: Partial<CreatePagoFormValues>;
  submitButtonText?: string;
  pagoId?: string; // ID para edición
}

export default function CreatePagoForm({
  setOpen,
  defaultValues,
  submitButtonText = "Crear pago",
  pagoId,
}: CreatePagoFormProps) {
  const form = useForm<CreatePagoFormValues>({
    resolver: zodResolver(CreatePagoFormSchema),
    defaultValues: {
      concepto: defaultValues?.concepto || "",
      monto: defaultValues?.monto || "0",
      fechaPago: defaultValues?.fechaPago || "",
      estado:
        (defaultValues?.estado as "Pagado" | "Pendiente" | "Cancelado") ||
        "Pendiente",
      medioPago:
        (defaultValues?.medioPago as
          | "PSE"
          | "Efectivo"
          | "Tarjeta de Debito"
          | "Tarjeta de Credito"
          | "Otro") || "PSE",
      cuotaId: defaultValues?.cuotaId || "",
      scoutId: defaultValues?.scoutId || "",
    },
  });

  async function onSubmit(values: CreatePagoFormValues) {
    if (pagoId) {
      // Modo edición: incluir el ID del pago
      try {
        const data = {
          id: pagoId,
          ...values,
        };

        // Simular llamada a API con datos mock
        console.log("Actualizando pago:", data);
        toast.success("Pago actualizado correctamente");
        setOpen(false);
      } catch (error) {
        toast.error("Error al actualizar el pago:", error as ExternalToast);
        console.error("Error al actualizar el pago:", error);
      }
    } else {
      // Modo creación: crear nuevo pago
      try {
        // Simular llamada a API con datos mock
        console.log("Creando pago:", values);
        toast.success("Pago creado correctamente");
        setOpen(false);
      } catch (error) {
        toast.error("Error al crear el pago:", error as ExternalToast);
        console.error("Error al crear el pago:", error);
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
            name="concepto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concepto</FormLabel>
                <FormControl>
                  <Input placeholder="Cuota mensual Scouts..." {...field} />
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
                  <Input type="text" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="fechaPago"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de pago</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
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
        <div className="col-span-full md:col-span-1">
          <FormField
            control={form.control}
            name="cuotaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuota</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una cuota" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCuotas.map((cuota) => (
                        <SelectItem key={cuota.id} value={cuota.id}>
                          {cuota.nombre} - ${cuota.monto} ({cuota.periodicidad})
                        </SelectItem>
                      ))}
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
            name="scoutId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integrante</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un integrante" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockScouts.map((scout) => (
                        <SelectItem key={scout.id} value={scout.id}>
                          {scout.nombre} - {scout.rama} ({scout.edad} años)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
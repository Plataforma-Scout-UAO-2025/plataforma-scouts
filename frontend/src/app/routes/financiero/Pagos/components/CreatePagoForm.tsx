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
import type { CreatePaymentDto } from "@/types/pago.type";
import api from "@/api/axios";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";

interface CreatePagoFormProps {
  setOpen: (open: boolean) => void;
  pago: CreatePaymentDto & { installment_id: string, payer_member_id: string }; // ID para edición
  onRefresh?: () => void; // Callback para refrescar la tabla
}

export default function CreatePagoForm({ setOpen, pago, onRefresh }: CreatePagoFormProps) {

  const tenantId = useTenant();

  const form = useForm<CreatePagoFormValues>({
    resolver: zodResolver(CreatePagoFormSchema),
    defaultValues: {
      paid_at: pago.paid_at || "",
      method:
        (pago.method as
          | "PSE"
          | "Efectivo"
          | "Tarjeta de Debito"
          | "Tarjeta de Credito"
          | "Otro") || "PSE",
      reference: pago.reference || "",
    },
  });

  async function onSubmit(values: CreatePagoFormValues) {

    const data = {
      payment_id: crypto.randomUUID(),
      installment_id: pago.installment_id,
      payer_member_id: pago.payer_member_id,
      ...values,
    }



    try {
      const response = await api.post(`/finanzas/payments/${tenantId}/installments/${pago.installment_id}/payments`, data);
      if(response.status === 201) {
        toast.success("Pago creado correctamente");
        setOpen(false);
        onRefresh?.(); // Refrescar la tabla después de crear el pago
      } else {
        toast.error("Error al crear el pago");
      }
    } catch {
      toast.error("Error al crear el pago");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-3 gap-6"
      >
        <div className="col-span-full">
          <FormField
            control={form.control}
            name="paid_at"
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
        <div className="col-span-full">
          <FormField
            control={form.control}
            name="method"
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
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input placeholder="Referencia" {...field} />
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
            Pagar
          </Button>
        </div>
      </form>
    </Form>
  );
}

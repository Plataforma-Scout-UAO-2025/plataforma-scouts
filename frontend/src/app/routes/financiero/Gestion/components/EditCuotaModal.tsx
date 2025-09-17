import { useState } from "react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import CreateCuotaForm from "./CreateCuotaForm";
import type { Cuota } from "../types/cuota.type";

interface EditCuotaModalProps {
  cuota: Cuota;
}

export default function EditCuotaModal({ cuota }: EditCuotaModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl tracking-tight font-bold mt-4">Editar cuota</DialogTitle>
          <DialogDescription>
            Modifica los parámetros de la cuota existente.
          </DialogDescription>
        </DialogHeader>

        <CreateCuotaForm 
          open={open}
          setOpen={setOpen}
          cuotaId={cuota.id}
          defaultValues={{
            nombre: cuota.nombre,
            monto: cuota.monto,
            periodicidad: cuota.periodicidad as "Mensual" | "Trimestral" | "Semestral" | "Anual",
            tipoCuota: cuota.tipoCuota as "Ordinaria" | "Extraordinaria",
            fechaLimitePago: cuota.fechaLimitePago,
            medioPago: cuota.medioPago as "PSE" | "Efectivo" | "Tarjeta de Debito" | "Tarjeta de Credito" | "Otro",
            aplicaA: cuota.aplicaA,
          }}
          onSuccess={() => setOpen(false)}
          submitButtonText="Actualizar cuota"
        />

      </DialogContent>
    </Dialog>
  );
}

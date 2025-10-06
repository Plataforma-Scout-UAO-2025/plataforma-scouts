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
import type { Cuota } from "@/types/cuota.type";

interface EditCuotaModalProps {
  cuota: Cuota;
  onRefresh?: () => void;
}

export default function EditCuotaModal({ cuota, onRefresh }: EditCuotaModalProps) {
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
          cuotaId={cuota.fee_id}
          isEditMode={true}
          onRefresh={onRefresh}
          defaultValues={{
            name: cuota.name,
            description: cuota.description,
            amount: cuota.amount,
            periodicity: cuota.periodicity,
            scope: cuota.scope,
            start_date: cuota.start_date,
            end_date: cuota.end_date,
            associated_to: cuota.associated_to,
          }}
          submitButtonText="Actualizar cuota"
        />

      </DialogContent>
    </Dialog>
  );
}

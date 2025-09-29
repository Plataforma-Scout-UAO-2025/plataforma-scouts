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
import { Plus } from "lucide-react";
import CreateCuotaForm from "./CreateCuotaForm";

export default function CreateCuotaModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="text-white" />
          Crear cuota
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl tracking-tight font-bold mt-4">Crear nueva cuota</DialogTitle>
          <DialogDescription>
            Define los parámetros de la cuota que se aplicará a tu grupo.
          </DialogDescription>
        </DialogHeader>

        <CreateCuotaForm open={open} setOpen={setOpen} />

      </DialogContent>
    </Dialog>
  );
}

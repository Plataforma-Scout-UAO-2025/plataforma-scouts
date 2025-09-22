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
import CreatePagoForm from "./CreatePagoForm";

export default function CreatePagoModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="text-white" />
          Crear pago
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl tracking-tight font-bold mt-4">Crear nuevo pago</DialogTitle>
          <DialogDescription>
            Registra un nuevo pago realizado por un miembro del grupo.
          </DialogDescription>
        </DialogHeader>

        <CreatePagoForm open={open} setOpen={setOpen} />

      </DialogContent>
    </Dialog>
  );
}

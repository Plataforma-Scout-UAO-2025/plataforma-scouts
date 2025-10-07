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
import { DollarSign } from "lucide-react";
import CreatePagoForm from "./CreatePagoForm";

export default function CreatePagoModal({ pago }: { pago: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white h-7" size="sm">
          <DollarSign className="text-white" />
          Pagar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl tracking-tight font-bold mt-4">
            Pagar cuota
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo pago realizado por un miembro del grupo para la cuota {pago.name}
          </DialogDescription>
        </DialogHeader>

        <CreatePagoForm setOpen={setOpen} pago={pago} />
      </DialogContent>
    </Dialog>
  );
}

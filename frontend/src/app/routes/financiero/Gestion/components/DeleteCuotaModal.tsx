import { Button } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import type { Cuota } from "../types/cuota.type";
import { toast, type ExternalToast } from "sonner";
import axios from "axios";

interface DeleteCuotaModalProps {
  cuota: Cuota;
}

export default function DeleteCuotaModal({ cuota }: DeleteCuotaModalProps) {
  const handleDelete = async () => {
    console.log("Eliminando cuota:", cuota.id);
    try{
      const response = await axios.delete(import.meta.env.VITE_BACKEND_URL + "finanzas/cuotas/" + cuota.id);
      if(response.status === 204) {
        toast.success("Cuota eliminada correctamente");
        window.location.reload();
      } else {
        toast.error("Error al eliminar la cuota:", response.data.message);
      }
    } catch (error) {
      toast.error("Error al eliminar la cuota:", error as ExternalToast);
      console.error("Error al eliminar la cuota:", error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente la cuota{" "}
            <strong>"{cuota.nombre}"</strong> del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancelar</Button>
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Eliminar cuota
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

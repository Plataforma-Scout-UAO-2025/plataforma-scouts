import { useState } from "react";
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
import type { Cuota } from "@/types/cuota.type";
import { toast } from "sonner";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

interface DeleteCuotaModalProps {
  cuota: Cuota;
  onRefresh?: () => void;
}

export default function DeleteCuotaModal({ cuota, onRefresh }: DeleteCuotaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const tenantId = useTenant();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (isDeleting) return; // Prevenir doble envío
    
    setIsDeleting(true);
    console.log("Eliminando cuota:", cuota.fee_id);
    
    try{
      const response = await api.delete(
        `finanzas/fees/${tenantId}/${cuota.fee_id}`
      );
      if(response.status === 204) {
        toast.success("Cuota eliminada correctamente");
        onRefresh?.();
      } else if (response.status === 401) {
        toast.error("No tienes permisos para realizar esta acción");
        navigate("/app/dashboard");
      } else {
        const backendMsg = (response.data as { message?: string } | undefined)?.message;
        toast.error(backendMsg || "Error al eliminar la cuota");
      }
    } catch (error) {
      const backendMsg = (error as AxiosError<{ message?: string }> )?.response?.data?.message;
      toast.error(backendMsg || "Error al eliminar la cuota");
    } finally {
      setIsDeleting(false);
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
            <strong>"{cuota.name}"</strong> del sistema y <b>todos sus pagos asociados.</b>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={isDeleting}>Cancelar</Button>
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Eliminar cuota"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

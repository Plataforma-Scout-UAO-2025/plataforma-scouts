import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PendingApprovalModalProps {
  isOpen: boolean;
}

/**
 * Modal que se muestra cuando un scout intenta acceder al sistema
 * pero su solicitud aún no ha sido aprobada (status !== "APPROVED").
 * 
 * Este modal:
 * - NO se puede cerrar clickeando fuera o con ESC
 * - Solo se cierra cuando el usuario hace logout
 * - Muestra un mensaje claro sobre el estado de su solicitud
 */
export default function PendingApprovalModal({ isOpen }: PendingApprovalModalProps) {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Solicitud Pendiente de Aprobación
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Tu solicitud aún no ha sido aprobada por los administradores del grupo.
            Por favor, espera a que tu solicitud sea revisada y aprobada.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Nota:</strong> Serás notificado por correo electrónico una vez que tu
            solicitud sea aprobada y puedas acceder al sistema.
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleLogout}
            className="w-full sm:w-auto"
            variant="primary"
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

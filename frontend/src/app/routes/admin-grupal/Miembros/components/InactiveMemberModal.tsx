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
import { XCircle } from "lucide-react";

interface InactiveMemberModalProps {
  isOpen: boolean;
}

/**
 * Modal que se muestra cuando un scout intenta acceder al sistema
 * pero está marcado como inactivo (isActive === false).
 * 
 * Este modal:
 * - NO se puede cerrar clickeando fuera o con ESC
 * - Solo se cierra cuando el usuario hace logout
 * - Muestra un mensaje claro sobre su estado de inactividad
 */
export default function InactiveMemberModal({ isOpen }: InactiveMemberModalProps) {
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
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            No Estás Actualmente Activo
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Tu cuenta no está activa en este momento.
            No puedes acceder a las funcionalidades del sistema hasta que tu cuenta sea reactivada.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-sm text-red-800 text-center">
            <strong>Nota:</strong> Si crees que esto es un error, por favor contacta
            a los administradores del grupo para más información.
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

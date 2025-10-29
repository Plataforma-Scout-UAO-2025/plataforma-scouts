import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserExistsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identification: string;
}

export function UserExistsDialog({
  open,
  onOpenChange,
  identification,
}: UserExistsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usuario ya registrado</AlertDialogTitle>
          <AlertDialogDescription>
            Ya existe un usuario registrado con el número de identificación{" "}
            <strong>{identification}</strong>. Por favor, verifica los datos e
            intenta nuevamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

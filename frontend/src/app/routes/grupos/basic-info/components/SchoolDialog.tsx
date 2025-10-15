import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function SchoolDialog({
  open,
  onResponse,
}: {
  open: boolean;
  onResponse: (include: boolean) => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Deseas incluir información escolar?</AlertDialogTitle>
          <AlertDialogDescription>
            Estos datos son opcionales pero nos ayudan a conocerte mejor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onResponse(false)}>
            No, enviar ahora
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onResponse(true)}>
            Sí, incluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

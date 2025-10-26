import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroupResponseDTO as Group } from "@/types/group.type";

interface GroupInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

export default function GroupInfoModal({
  open,
  onOpenChange,
  group,
}: GroupInfoModalProps) {

  // Early return después de todos los hooks
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Información del Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-lg">
              <strong>Nombre del Grupo:</strong> {group.name}
            </p>
            <p className="text-lg">
              <strong>Identificador:</strong> {group.slug}
            </p>
            <p className="text-lg">
              <strong>Correo Electrónico:</strong> {group.email || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Teléfono:</strong> {group.phone || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Dirección:</strong> {group.address || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Fundado En:</strong> {group.foundedIn || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Misión:</strong> {group.mission || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Visión:</strong> {group.vision || "N/A"}
            </p>
            <p className="text-lg">
              <strong>Estado:</strong> {group.isActive ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

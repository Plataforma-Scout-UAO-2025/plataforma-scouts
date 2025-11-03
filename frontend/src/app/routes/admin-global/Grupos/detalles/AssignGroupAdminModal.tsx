import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@/components/ui/index";
import type { GroupResponseDTO as Group } from "@/types/group.type";

interface AssignGroupAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

const AssignGroupAdminModal = ({ open, onOpenChange, group }: AssignGroupAdminModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!group) return;
    
    setLoading(true);
    try {
      // TODO: Implementar la lógica para asignar un administrador al grupo
      console.log("Asignar administrador al grupo:", group.groupId);
      
      // Por ahora solo cerramos el modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error asignando administrador:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignar Administrador al Grupo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {group && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Grupo: <span className="font-semibold text-foreground">{group.name}</span>
              </p>
            </div>
          )}
          
          {/* TODO: Agregar selector de miembros o formulario para asignar administrador */}
          <div className="text-center py-8 text-muted-foreground">
            <p>Funcionalidad en desarrollo...</p>
            <p className="text-sm mt-2">
              Aquí podrás seleccionar un miembro para asignarlo como administrador del grupo.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading}
          >
            {loading ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignGroupAdminModal;

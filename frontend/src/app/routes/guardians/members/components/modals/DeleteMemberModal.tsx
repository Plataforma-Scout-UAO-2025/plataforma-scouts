import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui/index";
import { AlertTriangle } from "lucide-react";
import type { MemberBasicInfo } from "@/types/guardian.type";

interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  birth_date?: string;
}

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: MemberBasicInfo | null;
  isDeleting?: boolean;
}

const DeleteMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  isDeleting = false
}: DeleteMemberModalProps) => {
  
  const getMemberName = (member: MemberBasicInfo): string => {
    const extendedMember = member as ExtendedMemberInfo;
    const firstName = extendedMember.first_name || extendedMember.firstName || "Nombre";
    const lastName = extendedMember.last_name || extendedMember.lastName || "desconocido";
    return `${firstName} ${lastName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar eliminación
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            ¿Estás seguro de que deseas eliminar a este miembro?
          </DialogDescription>
        </DialogHeader>
        
        {member && (
          <div className="py-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900">
                {getMemberName(member)}
              </p>
              <p className="text-sm text-gray-600">
                Rama: {member.subgroup?.name || "Sin rama"}
              </p>
              <p className="text-sm text-gray-600">
                Parentesco: {member.relationship || "No especificado"}
              </p>
            </div>
            <p className="text-sm text-red-600 mt-3 font-medium">
              Esta acción no se puede deshacer.
            </p>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMemberModal;
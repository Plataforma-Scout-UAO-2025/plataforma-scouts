import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@/components/ui/index";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, User } from "lucide-react";
import type { Member as MemberType } from "@/types/member.type";
import { formatDate } from "@/lib/utils";
import MemberInfoModal from "../detalles/memberInfoModal";
import { useMemberStatusDialog } from "@/hooks/useMemberStatusDialog";

interface MembersTableProps {
  filteredMembers: MemberType[];
}

const MembersTable = ({ filteredMembers }: MembersTableProps) => {
  // Hook para manejar el diálogo de confirmación de activar/desactivar
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedMember,
    isActive,
    handleDeleteClick,
    handleConfirmToggle,
  } = useMemberStatusDialog();

  // Estados para el modal de información del miembro
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedMemberForInfo, setSelectedMemberForInfo] =
    useState<MemberType | null>(null);

  // Función para abrir el modal de información del miembro
  const handleViewInfo = (member: MemberType) => {
    setSelectedMemberForInfo(member);
    setIsInfoModalOpen(true);
  };

  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="pl-4 font-bold text-primary">
              Id
            </TableHead>
            <TableHead className="font-bold text-primary">
              Nombres
            </TableHead>
            <TableHead className="font-bold text-primary">
              Apellidos
            </TableHead>
            <TableHead className="font-bold text-primary">
              Identificación
            </TableHead>
            <TableHead className="font-bold text-primary">Rama</TableHead>
            <TableHead className="font-bold text-primary">
              Creado
            </TableHead>
            <TableHead className="font-bold text-primary">
              Dirección
            </TableHead>
            <TableHead className="font-bold text-primary">
              Rol
            </TableHead>
            <TableHead className="font-bold text-primary">
              Estado
            </TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => (
              <TableRow key={member.member_id ?? `member-${idx}`}>
                <TableCell className="pl-4 font-medium truncate">
                  {member.member_id}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.first_name}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.last_name}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.identification}
                </TableCell>
                <TableCell className="w-28 truncate">
                  {member.subgroup?.section?.name || "Sin rama"}
                </TableCell>
                <TableCell className="w-28 truncate">
                  {formatDate(member.created_at)}
                </TableCell>
                <TableCell className="w-40 truncate">
                  {member.address || "Sin dirección"}
                </TableCell>
                <TableCell className="w-40 truncate">
                  {member.role}
                </TableCell>
                <TableCell>
                  {isActive(member) ? (
                    <span className="inline-block px-2 py-1 rounded-lg border border-green-300 bg-green-100 text-green-800 font-semibold">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold">
                      Inactivo
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="iconbutton" size="icon" onClick={() => handleViewInfo(member)}>
                    <User />
                  </Button>
                  <Button
                    variant="iconbutton"
                    size="icon"
                    className="text-secondary hover:text-blue-800"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="iconbutton"
                    size="icon"
                    className="text-destructive hover:text-destructive-hover"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow key="no-members">
              <TableCell colSpan={9} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron miembros que coincidan con los filtros.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Diálogo de confirmación para activar/desactivar miembro */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedMember && isActive(selectedMember)
                ? "¿Desea desactivar al miembro?"
                : "¿Desea activar al miembro?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de{" "}
              <strong>
                {selectedMember?.first_name} {selectedMember?.last_name}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de información del miembro */}
      <MemberInfoModal
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        member={selectedMemberForInfo}
      />
    </div>
  );
};
export default MembersTable;

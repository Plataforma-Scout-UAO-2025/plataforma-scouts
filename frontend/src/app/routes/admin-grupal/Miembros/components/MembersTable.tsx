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
import { Pencil, ToggleLeft, User } from "lucide-react";
import type { Member as MemberType } from "@/types/member.type";
import MemberInfoModal from "../detalles/memberInfoModal";
import EditMemberModal from "../../../grupos/basic-info/EditMemberModal";
import { useMemberStatusDialog } from "@/hooks/useMemberStatusDialog";

interface MembersTableProps {
  filteredMembers: MemberType[];
}

interface Member {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

const MembersTable = ({ filteredMembers }: MembersTableProps) => {
  const getIsActive = (member: Member): boolean => {
    const value = member.is_active ?? member.isActive;
    if (typeof value === "string") {
      return value.toLowerCase() === "activo" || value.toLowerCase() === "true";
    }
    if (typeof value === "number") {
      return value === 1;
    }
    return Boolean(value);
  };

  const formatRole = (role?: string): string => {
    if (!role) return "";
    return role
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedMember,
    isActive,
    handleDeleteClick,
    handleConfirmToggle,
  } = useMemberStatusDialog();

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedMemberForInfo, setSelectedMemberForInfo] =
    useState<MemberType | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] =
    useState<MemberType | null>(null);

  const handleViewInfo = (member: MemberType) => {
    setSelectedMemberForInfo(member);
    setIsInfoModalOpen(true);
  };

  const handleEdit = (member: MemberType) => {
    setSelectedMemberForEdit(member);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="font-bold text-primary">Nombres</TableHead>
            <TableHead className="font-bold text-primary">Apellidos</TableHead>
            <TableHead className="font-bold text-primary">Edad</TableHead>
            <TableHead className="font-bold text-primary">Rama</TableHead>
            <TableHead className="font-bold text-primary">Subrama</TableHead>
            <TableHead className="font-bold text-primary">Rol</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="font-bold text-primary text-center">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => {
              return (
                <TableRow key={member.memberId ?? `member-${idx}`}>
                  <TableCell className="w-1/6 truncate">{member.firstName}</TableCell>
                  <TableCell className="w-1/6 truncate">{member.lastName}</TableCell>
                  <TableCell className="w-1/6 truncate">{member.age}</TableCell>
                  <TableCell className="w-1/6 truncate">
                    {member.subgroup?.section?.name || "Sin Rama"}
                  </TableCell>
                  <TableCell className="w-1/6 truncate">
                    {member.subgroup?.name || "Sin Subrama"}
                  </TableCell>
                  <TableCell className="w-1/6 truncate">
                    {formatRole(member.role)}
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
                  <TableCell className="text-center">
                    <Button
                      variant="iconbutton"
                      size="icon"
                      onClick={() => handleViewInfo(member)}
                    >
                      <User />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-secondary hover:text-blue-800"
                      onClick={() => handleEdit(member)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-red-800 hover:text-green-800"
                      onClick={() => handleDeleteClick(member)}
                    >
                      <ToggleLeft />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow key="no-members">
              <TableCell colSpan={10} className="text-center py-8">
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
                {selectedMember
                  ? `${
                      (selectedMember as MemberType).firstName ??
                      (selectedMember as MemberType).first_name
                    } ${
                      (selectedMember as MemberType).lastName ??
                      (selectedMember as MemberType).last_name
                    }`
                  : ""}
              </strong>{" "}
              a{" "}
              <strong>
                {selectedMember && getIsActive(selectedMember)
                  ? "INACTIVO"
                  : "ACTIVO"}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              {selectedMember && isActive(selectedMember)
                ? "Desactivar"
                : "Activar"}
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

      {/* Modal de edición del miembro */}
      <EditMemberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={selectedMemberForEdit}
        onSuccess={() => {
          
        }}
      />
    </div>
  );
};

export default MembersTable;

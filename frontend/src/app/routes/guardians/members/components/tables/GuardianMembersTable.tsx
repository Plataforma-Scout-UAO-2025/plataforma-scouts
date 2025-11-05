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
import { Pencil, Trash, User, ArrowRightLeft} from "lucide-react";
import type { MemberBasicInfo } from "@/types/guardian.type";
import type { UpdateMember } from "@/types/member.type";
import DeleteMemberModal from "@/app/routes/guardians/members/components/modals/DeleteMemberModal";

interface GuardianMembersTableProps {
  filteredMembers: MemberBasicInfo[];
  onViewMember?: (member: MemberBasicInfo) => void;
  onEditMember?: (member: UpdateMember) => void;
  onDeleteMember?: (member: MemberBasicInfo) => void;
  onReassignGuardian?: (member: MemberBasicInfo) => void;
}

interface Member {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  birth_date?: string;
}

const GuardianMembersTable = ({ 
  filteredMembers, 
  onViewMember, 
  onEditMember, 
  onDeleteMember,
  onReassignGuardian,
}: GuardianMembersTableProps) => {

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberBasicInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isActive = (member: Member): boolean => {
    const value = member.is_active ?? member.isActive;
    if (typeof value === "string") {
      return value.toLowerCase() === "activo" || value.toLowerCase() === "true";
    }
    if (typeof value === "number") {
      return value === 1;
    }
    return Boolean(value);
  };

  const getAge = (birthDate?: string): string => {
    if (!birthDate) return "N/A";
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Función para formatear género
  const formatGender = (gender?: string): string => {
    if (!gender) return "N/A";
    if (gender === "Masculino") return "M";
    if (gender === "Femenino") return "F";
    return gender.charAt(0).toUpperCase();
  };

  const handleDeleteClick = (member: MemberBasicInfo) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };
  

  const handleConfirmDelete = async () => {
    if (memberToDelete && onDeleteMember) {
      setIsDeleting(true);
      try {
        await onDeleteMember(memberToDelete);
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
      } catch (error) {
        console.error('Error deleting member:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  return (
      <div className="w-full">
      <Table className="text-sm w-full">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="pl-4 font-bold text-primary text-center w-[8%]">
              ID
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[12%]">
              Nombres
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[12%]">
              Apellidos
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[8%]">
              Edad
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[8%]">
              Género
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[12%]">
              Rama
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[12%]">
              Parentesco
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[12%]">
              Estado
            </TableHead>
            <TableHead className="font-bold text-primary text-center w-[16%]">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => {
              const memberRec = member as ExtendedMemberInfo;
              const memberId = memberRec.member_id || memberRec.userId || memberRec.memberId || idx;
              const firstName = memberRec.first_name || memberRec.firstName || "N/A";
              const lastName = memberRec.last_name || memberRec.lastName || "N/A";
              const gender = memberRec.gender || "N/A";
              const birthDate = memberRec.birth_date || memberRec.birthDate;
              const relationship = memberRec.relationship || "No especificado";
              return (
                <TableRow key={`member-${memberId}-${idx}`}>
                  <TableCell className="pl-4 font-medium text-center">
                    {memberId}
                  </TableCell>
                  <TableCell className="text-center">
                    {firstName}
                  </TableCell>
                  <TableCell className="text-center">
                    {lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    {memberRec.age || getAge(birthDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatGender(gender)}
                  </TableCell>
                  <TableCell className="text-center">
                    {member.subgroup?.name || "Sin rama"}
                  </TableCell>
                  <TableCell className="text-center">
                    {relationship}
                  </TableCell>
                  <TableCell className="text-center">
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
                      onClick={() => onViewMember?.(member)}
                      title="Ver detalles"
                    >
                      <User />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-secondary hover:text-blue-800"
                      onClick={() => onEditMember?.(member as UpdateMember)}
                      title="Editar miembro"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      onClick={() => onReassignGuardian?.(member)}
                      title="Reasignar acudiente"
                    >
                      <ArrowRightLeft />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-destructive hover:text-destructive-hover"
                      onClick={() => handleDeleteClick(member)}
                      title="Eliminar miembro"
                    >
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron miembros a cargo.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        member={memberToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default GuardianMembersTable;
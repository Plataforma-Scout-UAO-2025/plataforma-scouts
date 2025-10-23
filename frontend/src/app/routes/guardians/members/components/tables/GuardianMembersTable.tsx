import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@/components/ui/index";
import { Pencil, Trash, User } from "lucide-react";
import type { MemberBasicInfo } from "@/types/guardian.type";

interface GuardianMembersTableProps {
  filteredMembers: MemberBasicInfo[];
  onViewMember?: (member: MemberBasicInfo) => void;
  onEditMember?: (member: MemberBasicInfo) => void;
  onDeleteMember?: (member: MemberBasicInfo) => void;
}

interface Member {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

const GuardianMembersTable = ({ 
  filteredMembers, 
  onViewMember, 
  onEditMember, 
  onDeleteMember 
}: GuardianMembersTableProps) => {
  
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

  // Función para obtener edad a partir de birth_date
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

  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="pl-4 font-bold text-primary">
              ID
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
            <TableHead className="font-bold text-primary">
              Edad
            </TableHead>
            <TableHead className="font-bold text-primary">
              Género
            </TableHead>
            <TableHead className="font-bold text-primary">
              Teléfono
            </TableHead>
            <TableHead className="font-bold text-primary">
              Rama
            </TableHead>
            <TableHead className="font-bold text-primary">
              Parentesco
            </TableHead>
            <TableHead className="font-bold text-primary">
              Estado
            </TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => {
              // Acceder directamente a los campos del backend (con underscore)
              const memberRec = member as any;
              const userId = memberRec.userId || memberRec.user_id || idx;
              const firstName = memberRec.first_name || memberRec.firstName || "N/A";
              const lastName = memberRec.last_name || memberRec.lastName || "N/A";
              const identification = memberRec.identification || "N/A";
              const phone = memberRec.phone || "N/A";
              const gender = memberRec.gender || "N/A";
              const birthDate = memberRec.birth_date || memberRec.birthDate;
              const relationship = memberRec.relationship || "No especificado";

              return (
                <TableRow key={`member-${userId}-${idx}`}>
                  <TableCell className="pl-4 font-medium truncate">
                    {userId}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {firstName}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {lastName}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {identification}
                  </TableCell>
                  <TableCell className="w-20 truncate">
                    {memberRec.age || getAge(birthDate)}
                  </TableCell>
                  <TableCell className="w-20 truncate">
                    {formatGender(gender)}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {phone}
                  </TableCell>
                  <TableCell className="w-28 truncate">
                    {member.subgroup?.name || "Sin rama"}
                  </TableCell>
                  <TableCell className="w-32 truncate">
                    {relationship}
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
                      onClick={() => onEditMember?.(member)}
                      title="Editar miembro"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-destructive hover:text-destructive-hover"
                      onClick={() => onDeleteMember?.(member)}
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
              <TableCell colSpan={11} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron miembros a cargo.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuardianMembersTable;
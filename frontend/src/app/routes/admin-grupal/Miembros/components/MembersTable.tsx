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
import type { Member as MemberType } from "@/types/member.type";

interface MembersTableProps {
  filteredMembers: MemberType[];
}

interface Member {
  is_active?: boolean | string | number;
  isActive?: boolean | string | number;
}

const MembersTable = ({ filteredMembers }: MembersTableProps) => {
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

  const formatRole = (role?: string): string => {
    if (!role) return "";
    return role
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
            filteredMembers.map((member, idx) => (
              <TableRow key={member.memberId ?? `member-${idx}`}>
                <TableCell className="w-1/8 truncate">
                  {member.firstName}
                </TableCell>
                <TableCell className="w-1/8 truncate">
                  {member.lastName}
                </TableCell>
                <TableCell className="w-1/8 truncate">{member.age}</TableCell>
                <TableCell className="w-1/8 truncate">
                  {member.subgroup?.section?.name || "Sin rama"}
                </TableCell>
                <TableCell className="w-1/8 truncate">
                  {member.subgroup?.name || "Sin Subrama"}
                </TableCell>
                <TableCell className="w-1/8 truncate">
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
                  <Button variant="iconbutton" size="icon">
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
    </div>
  );
};
export default MembersTable;

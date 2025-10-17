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
import { formatDate } from "@/lib/utils";

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

  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="pl-4 font-bold text-primary w-16">
              Id
            </TableHead>
            <TableHead className="font-bold text-primary w-24">
              Nombres
            </TableHead>
            <TableHead className="font-bold text-primary w-24">
              Apellidos
            </TableHead>
            <TableHead className="font-bold text-primary w-36">
              Identificación
            </TableHead>
            <TableHead className="font-bold text-primary w-24">Rama</TableHead>
            <TableHead className="font-bold text-primary w-24">
              Creado
            </TableHead>
            <TableHead className="font-bold text-primary w-32">
              Dirección
            </TableHead>
            <TableHead className="font-bold text-primary w-24">
              Estado
            </TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => (
              <TableRow key={member.member_id ?? `member-${idx}`}>
                <TableCell className="pl-4 font-medium w-16 truncate">
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

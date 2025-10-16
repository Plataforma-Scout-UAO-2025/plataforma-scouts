import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import type { Member } from "@/types/member.type";

interface MembersTableProps {
  filteredMembers: Member[];
}

const MembersTable = ({ filteredMembers }: MembersTableProps) => {
  // Función para formatear la fecha
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <div>
      <Table className="text-sm px-0 table-fixed">
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
            <TableHead className="font-bold text-primary w-24">
              Estado
            </TableHead>
            <TableHead className="font-bold text-primary w-32">
              Dirección
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <TableRow key={member.member_id || index}>
                <TableCell className="pl-4 font-medium w-16 truncate">
                  {member.member_id || "N/A"}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.first_name || "N/A"}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.last_name || "N/A"}
                </TableCell>
                <TableCell className="w-32 truncate">
                  {member.identification || "N/A"}
                </TableCell>
                <TableCell className="w-28 truncate">
                  {member.subgroup?.section?.name || "Sin rama"}
                </TableCell>
                <TableCell className="w-28 truncate">
                  {formatDate(member.created_at)}
                </TableCell>
                <TableCell className="w-24 truncate">
                  {member.status || "N/A"}
                </TableCell>
                <TableCell className="w-40 truncate">
                  {member.address || "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
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

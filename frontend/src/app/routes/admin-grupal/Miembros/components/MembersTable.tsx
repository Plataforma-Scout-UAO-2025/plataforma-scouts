import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import { Pencil, Trash, User, Medal } from "lucide-react";
import type { Member } from "@/types/member.type";
import { formatDate } from "@/lib/utils";

interface MembersTableProps {
  filteredMembers: Member[];
}

const MembersTable = ({ filteredMembers }: MembersTableProps) => {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aceptado",
    REJECTED: "Rechazado",
  };
  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="pl-4 font-bold text-primary">Id</TableHead>
            <TableHead className="font-bold text-primary">Nombres</TableHead>
            <TableHead className="font-bold text-primary">Apellidos</TableHead>
            <TableHead className="font-bold text-primary">
              Identificación
            </TableHead>
            <TableHead className="font-bold text-primary">Rama</TableHead>
            <TableHead className="font-bold text-primary">Creado</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="font-bold text-primary">Dirección</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell className="pl-4 font-medium">{member.member_id}</TableCell>
                <TableCell>{member.first_name}</TableCell>
                <TableCell>{member.last_name}</TableCell>
                <TableCell>{member.identification}</TableCell>
                <TableCell>
                  {member.branch && member.branch.length > 0
                    ? member.branch.map((rama) => rama.name).join(", ")
                    : "Sin rama"}
                </TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
                <TableCell>{statusLabels[member.status ?? "Aprobado"]}</TableCell>
                <TableCell>{member.address}</TableCell>
                <TableCell className="text-right">
                  <Button variant="iconbutton" size="icon">
                    <User />
                  </Button>
                  <Button variant="iconbutton" size="icon">
                    <Medal />
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

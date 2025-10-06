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
import type { Member } from "../types/member.type";

interface MembersTableProps {
  filteredMembers: Member[];
  loading?: boolean;
  onView?: (member: Member) => void;
}

const MembersTable = ({
  filteredMembers,
  loading = false,
  onView,
}: MembersTableProps) => {
  if (loading) {
    return (
      <div className="py-8 text-center text-primary font-medium">
        Cargando miembros...
      </div>
    );
  }

  return (
    <div className="border-3 border-primary rounded-lg overflow-hidden">
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow className="border-b border-primary hover:bg-transparent">
            <TableHead className="pl-4 font-bold text-primary">Id</TableHead>
            <TableHead className="font-bold text-primary">Nombres</TableHead>
            <TableHead className="font-bold text-primary">Apellidos</TableHead>
            <TableHead className="font-bold text-primary">
              Identificación
            </TableHead>
            <TableHead className="font-bold text-primary">Creado</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="font-bold text-primary">Ciudad</TableHead>
            <TableHead className="font-bold text-primary">Rama</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell className="pl-4 font-medium">
                  {member.member_id}
                </TableCell>
                <TableCell>{member.first_name}</TableCell>
                <TableCell>{member.last_name}</TableCell>
                <TableCell>{member.identification}</TableCell>
                <TableCell>{member.acceptance_date}</TableCell>
                <TableCell>{member.status}</TableCell>
                <TableCell>{member.city}</TableCell>
                <TableCell>{member.branch || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="iconbutton"
                    size="icon"
                    title="Ver detalles"
                    onClick={() => onView?.(member)}
                  >
                    <User />
                  </Button>
                  <Button variant="iconbutton" size="icon" title="Editar">
                    <Pencil />
                  </Button>
                  <Button variant="iconbutton" size="icon" title="Insignias">
                    <Medal />
                  </Button>
                  <Button
                    variant="iconbutton"
                    size="icon"
                    className="text-destructive hover:text-destructive-hover"
                    title="Eliminar"
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

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import { Eye } from "lucide-react";
import type { Member } from "@/types/member.type";

interface RejectedTableProps {
  filteredMembers: Member[];
}

const RejectedTable = ({ filteredMembers }: RejectedTableProps) => {
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
            <TableHead className="font-bold text-primary">Dirección</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
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
                <TableCell>{member.address || "Sin dirección"}</TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold">
                    {statusLabels[member.status ?? "Rechazado"]}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="primary" size="sm" title="Ver detalles">
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron solicitudes rechazadas.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RejectedTable;

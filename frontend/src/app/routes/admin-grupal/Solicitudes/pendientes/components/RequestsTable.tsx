import { useState } from "react";
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
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchMemberAction } from "@/store/members/membersActions";

interface RequestsTableProps {
  filteredMembers: Member[];
  onViewMember: (member: Member) => void;
  loading?: boolean;
}

const RequestsTable = ({ filteredMembers, onViewMember, loading }: RequestsTableProps) => {
  const [loadingMemberId, setLoadingMemberId] = useState<number | null>(null);
  const dispatch = useAppDispatch();

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aceptado",
    REJECTED: "Rechazado",
  };

  const handleView = async (member: Member) => {
    if (typeof member.member_id !== "number") {
      alert("El ID del miembro no es válido.");
      return;
    }
    try {
      setLoadingMemberId(member.member_id);
      const result = await dispatch(fetchMemberAction(member.member_id)).unwrap();
      onViewMember(result);
    } catch (err) {
      console.error("Error al obtener detalles:", err);
      alert("Error al cargar los detalles del miembro");
    } finally {
      setLoadingMemberId(null);
    }
  };

  return (
    <div className="border-3 border-primary rounded-lg overflow-hidden">
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow className="border-b border-primary">
            <TableHead className="pl-4 font-bold text-primary">Id</TableHead>
            <TableHead className="font-bold text-primary">Nombres</TableHead>
            <TableHead className="font-bold text-primary">Apellidos</TableHead>
            <TableHead className="font-bold text-primary">Identificación</TableHead>
            <TableHead className="font-bold text-primary">Ciudad</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="text-center font-bold text-primary">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && filteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Cargando solicitudes...
              </TableCell>
            </TableRow>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell className="pl-4 font-medium">{member.member_id}</TableCell>
                <TableCell>{member.first_name}</TableCell>
                <TableCell>{member.last_name}</TableCell>
                <TableCell>{member.identification}</TableCell>
                <TableCell>{member.address?.split(",")[0] || "N/A"}</TableCell>
                <TableCell>
                  <span className="py-1 px-2 rounded font-medium bg-gray-300 text-gray-800">
                    {statusLabels[member.status ?? "PENDING"]}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="primary"
                    size="sm"
                    title="Ver detalles"
                    onClick={() => handleView(member)}
                    disabled={loadingMemberId === member.member_id}
                  >
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron solicitudes pendientes.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsTable;
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
import { Trash, Info, Pencil, UserPlus } from "lucide-react";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import GroupInfoModal from "../detalles/GroupInfoModal";

const group = {
  groupId: 1,
  tenant_id: "23",
  slug: "centinelas-113",
  name: "Centinelas 113",
  district: "Distrito Central",
  email: "centinelas113@example.com",
  phone: "+1234567890",
  address: "Calle Falsa 123, Ciudad Scout",
  foundedIn: "1990-05-15",
  mission: "Formar líderes comprometidos con la sociedad.",
  vision: "Ser una comunidad scout ejemplar a nivel nacional.",
  identifierNumber: "113",
  isActive: true,
};

const GroupsTable = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const isActive = () => {
    return "ACTIVE";
  };

  const handleViewInfo = (group: Group) => {
    setSelectedGroup(group);
    setIsInfoModalOpen(true);
  };
  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="font-bold text-primary">Nombre</TableHead>
            <TableHead className="font-bold text-primary">
              Número de Miembros
            </TableHead>
            <TableHead className="font-bold text-primary">
              Número de Ramas
            </TableHead>
            <TableHead className="font-bold text-primary">
              Número de Subramas
            </TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="font-bold text-primary text-center">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="w-1/6 truncate">Centinelas 113</TableCell>
            <TableCell className="w-1/6 truncate">120</TableCell>
            <TableCell className="w-1/6 truncate">5</TableCell>
            <TableCell className="w-1/6 truncate">10</TableCell>
            <TableCell>
              {isActive() ? (
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
                onClick={() => handleViewInfo(group)}
              >
                <Info />
              </Button>
              <Button
                variant="iconbutton"
                size="icon"
                className="text-black hover:text-green-800"
              >
                <UserPlus />
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
          {/*<TableRow key="no-members">
            <TableCell colSpan={10} className="text-center py-8">
              <p className="text-text text-lg">
                No se encontraron grupos que coincidan con los filtros.
              </p>
            </TableCell>
          </TableRow>*/}
        </TableBody>
      </Table>

      {/* Diálogo de confirmación para activar/desactivar grupo */}
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desea activar al grupo?"</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de <strong></strong> a{" "}
              <strong></strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Activar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GroupInfoModal
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        group={selectedGroup}
      />
    </div>
  );
};

export default GroupsTable;

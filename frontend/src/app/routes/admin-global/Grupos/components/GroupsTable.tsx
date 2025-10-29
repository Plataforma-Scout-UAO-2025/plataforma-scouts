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
import { Info, Pencil, UserPlus } from "lucide-react";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import GroupInfoModal from "../detalles/GroupInfoModal";
import GroupAdminModal from "../detalles/GroupAdminModal";
import GroupEditModal from "../detalles/GroupEditModal";
import { useGroupManagement } from "@/hooks/useGroupManagement";

const groups = [
  {
    groupId: 1,
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
  },
  {
    groupId: 2,
    tenant_id: "24",
    slug: "803-chiminigaguas",
    name: "803 Chiminigaguas",
    district: "Distrito Norte",
    email: "803chiminigaguas@example.com",
    phone: "+0987654321",
    address: "Avenida Siempre Viva 742, Ciudad Scout",
    foundedIn: "1985-09-20",
    mission: "Fomentar el amor por la naturaleza y el servicio comunitario.",
    vision: "Ser reconocidos por nuestra labor en la conservación ambiental.",
    identifierNumber: "114",
    isActive: false,
  },
];

const GroupsTable = () => {
  const {
    isActive,
    handleViewInfo,
    handleAdminGroup,
    handleEditClick,
  } = useGroupManagement();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<Group | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroupEdit, setSelectedGroupEdit] = useState<Group | null>(
    null
  );
  const [isAdminGroupOpen, setIsAdminGroupOpen] = useState(false);
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState<Group | null>(
    null
  );

  const member = { name: "Juan Pérez" };

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
            <TableHead className="font-bold text-primary">
              Lider de Grupo
            </TableHead>
            <TableHead className="font-bold text-primary text-center">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length > 0 ? (
            groups.map((group, idx) => {
              return (
                <TableRow key={group.groupId ?? `group-${idx}`}>
                  <TableCell className="w-1/6 truncate">{group.name}</TableCell>
                  <TableCell className="w-1/6 truncate">120</TableCell>
                  <TableCell className="w-1/6 truncate">5</TableCell>
                  <TableCell className="w-1/6 truncate">10</TableCell>
                  <TableCell className="w-1/6 truncate">
                    {isActive(group) ? (
                      <span className="inline-block px-2 py-1 rounded-lg border border-green-300 bg-green-100 text-green-800 font-semibold">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold">
                        Inactivo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="w-1/6 truncate">
                    {member.name || "Sin líder asignado"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="iconbutton"
                      size="icon"
                      onClick={() => handleViewInfo(group as Group, setIsInfoModalOpen, setSelectedGroupInfo)}
                    >
                      <Info />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-black hover:text-primary"
                      onClick={() => handleAdminGroup(group as Group, setIsAdminGroupOpen, setSelectedGroupAdmin)}
                    >
                      <UserPlus />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-secondary hover:text-blue-800"
                      onClick={() => {
                        handleEditClick(group as Group, setIsEditModalOpen, setSelectedGroupEdit);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow key="no-members">
              <TableCell colSpan={10} className="text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron grupos que coincidan con los filtros.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <GroupInfoModal
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        group={selectedGroupInfo}
      />

      <GroupAdminModal
        open={isAdminGroupOpen}
        onOpenChange={setIsAdminGroupOpen}
        group={selectedGroupAdmin}
      />

      <GroupEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        group={selectedGroupEdit}
      />
    </div>
  );
};

export default GroupsTable;

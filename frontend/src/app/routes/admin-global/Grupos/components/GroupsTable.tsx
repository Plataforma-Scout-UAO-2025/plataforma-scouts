import { useState, useEffect, useMemo } from "react";
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
import { useGroup } from "@/hooks/useGroup";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGroupsAction } from "@/store/groups/groupsActions";
import GroupInfoModal from "../detalles/GroupInfoModal";
import GroupAdminModal from "../detalles/GroupAdminModal";
import GroupEditModal from "../detalles/GroupEditModal";
import AssignGroupAdminModal from "../detalles/AssignGroupAdminModal";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import FullScreenLoader from "@/components/common/FullScreenLoader";

const GroupsTable = () => {
  const dispatch = useAppDispatch();
  const { groups, loading, error } = useGroup();
  const { isActive, handleViewInfo, handleAdminGroup, handleEditClick } = useGroupManagement();

  // Estados para modales
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<Group | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroupEdit, setSelectedGroupEdit] = useState<Group | null>(null);
  const [isAdminGroupOpen, setIsAdminGroupOpen] = useState(false);
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState<Group | null>(null);
  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [selectedGroupForAssign, setSelectedGroupForAssign] = useState<Group | null>(null);

  // Fetch grupos solo si no están cargados
  useEffect(() => {
    if (!groups || groups.length === 0) {
      dispatch(fetchGroupsAction());
    }
  }, [dispatch, groups]);

  // Memoizar grupos ordenados por nombre
  const sortedGroups = useMemo(() => {
    if (!groups) return [];
    return [...groups].sort((a, b) => a.group.name.localeCompare(b.group.name));
  }, [groups]);

  if (loading) {
    return <FullScreenLoader message="Cargando..." />;
  }

  return (
    <div>
      <Table className="text-sm">
        <TableHeader className="text-primary">
          <TableRow>
            <TableHead className="font-bold text-primary">Nombre</TableHead>
            <TableHead className="font-bold text-primary">Administrador</TableHead>
            <TableHead className="font-bold text-primary">Estado</TableHead>
            <TableHead className="font-bold text-primary text-center">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-muted-foreground text-lg">Cargando grupos...</p>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-red-600 text-lg">Error cargando grupos: {error}</p>
              </TableCell>
            </TableRow>
          ) : (
            sortedGroups.map((groupWithLeader, idx) => {
              const { group, inChargeOf } = groupWithLeader;
              return (
                <TableRow key={group.groupId ?? `group-${idx}`}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    {inChargeOf ? (
                      <span className="inline-block px-2 py-1 rounded-lg border border-green-300 bg-green-100 text-green-800 font-semibold">
                        {inChargeOf.firstName} {inChargeOf.lastName}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold">
                          SIN ASIGNAR
                        </span>
                        <Button
                          variant="iconbutton"
                          size="icon"
                          className="text-black hover:text-primary"
                          onClick={() => {
                            setSelectedGroupForAssign(group);
                            setIsAssignAdminOpen(true);
                          }}
                        >
                          <UserPlus />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive(group as Group & Record<string, unknown>) ? (
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
                      onClick={() => handleViewInfo(group, setIsInfoModalOpen, setSelectedGroupInfo)}
                    >
                      <Info />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-black hover:text-primary"
                      onClick={() => handleAdminGroup(group, setIsAdminGroupOpen, setSelectedGroupAdmin)}
                    >
                      <UserPlus />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-secondary hover:text-blue-800"
                      onClick={() => {
                        handleEditClick(group, setIsEditModalOpen, setSelectedGroupEdit);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
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

      <AssignGroupAdminModal
        open={isAssignAdminOpen}
        onOpenChange={setIsAssignAdminOpen}
        group={selectedGroupForAssign}
      />
    </div>
  );
};

export default GroupsTable;

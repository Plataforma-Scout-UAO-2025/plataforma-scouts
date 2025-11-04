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
import { fetchGroupsWithAdminsAction } from "@/store/groups/groupsActions";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import FullScreenLoader from "@/components/common/FullScreenLoader";
import GroupInfoModal from "../detalles/GroupInfoModal";
import GroupAdminModal from "../detalles/GroupAdminModal";
import GroupEditModal from "../detalles/GroupEditModal";

const GroupsTable = () => {
  const dispatch = useAppDispatch();
  const { groupsWithAdmins, loading, error } = useGroup();
  const { isActive, handleViewInfo, handleAdminGroup, handleEditClick } = useGroupManagement();
  
  // Estados para modales
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<Group | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroupEdit, setSelectedGroupEdit] = useState<Group | null>(null);
  const [isAdminGroupOpen, setIsAdminGroupOpen] = useState(false);
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState<Group | null>(null);

  useEffect(() => {
    dispatch(fetchGroupsWithAdminsAction());
  }, [dispatch]);

  // Memoizar grupos ordenados por nombre y transformar a GroupResponseDTO
  const sortedGroups = useMemo(() => {
    if (!groupsWithAdmins) return [];
    
    return [...groupsWithAdmins]
      .map((item) => ({
        ...item,
        groupTransformed: {
          groupId: item.group.group_id,
          tenant_id: item.group.tenant_id,
          slug: item.group.slug,
          name: item.group.name,
          district: item.group.district,
          identifierNumber: item.group.identifier_number,
          address: item.group.address,
          phone: item.group.phone,
          email: item.group.email,
          foundedIn: item.group.founded_in,
          motto: item.group.motto,
          mission: item.group.mission,
          vision: item.group.vision,
          history: item.group.history,
          logoObjectId: item.group.logo_object_url,
          scarfObjectId: item.group.scarf_object_url,
          socialLinks: item.group.social_links,
          config: item.group.config,
          isActive: item.group.is_active,
          status: item.group.status,
          createdAt: item.group.created_at,
          updatedAt: item.group.updated_at,
        } as Group,
      }))
      .sort((a, b) => a.group.name.localeCompare(b.group.name));
  }, [groupsWithAdmins]);

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
                <div className="flex flex-col items-center gap-4">
                  <p className="text-red-600 text-lg">Error cargando grupos: {error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => dispatch(fetchGroupsWithAdminsAction())}
                  >
                    Reintentar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : sortedGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <p className="text-muted-foreground text-lg">No hay grupos disponibles</p>
              </TableCell>
            </TableRow>
          ) : (
            sortedGroups.map((item, idx) => {
              const { groupTransformed, inChargeOf } = item;
              return (
                <TableRow key={groupTransformed.groupId ?? `group-${idx}`}>
                  <TableCell className="font-medium">{groupTransformed.name}</TableCell>
                  <TableCell>
                    {inChargeOf ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{inChargeOf.full_name}</span>
                        {inChargeOf.email && (
                          <span className="text-xs text-muted-foreground">{inChargeOf.email}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Sin administrador</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive(groupTransformed as Group & Record<string, unknown>) ? (
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
                      onClick={() => handleViewInfo(groupTransformed, setIsInfoModalOpen, setSelectedGroupInfo)}
                    >
                      <Info />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-black hover:text-primary"
                      onClick={() => handleAdminGroup(groupTransformed, setIsAdminGroupOpen, setSelectedGroupAdmin)}
                    >
                      <UserPlus />
                    </Button>
                    <Button
                      variant="iconbutton"
                      size="icon"
                      className="text-secondary hover:text-blue-800"
                      onClick={() => {
                        handleEditClick(groupTransformed, setIsEditModalOpen, setSelectedGroupEdit);
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
    </div>
  );
};

export default GroupsTable;

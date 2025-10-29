import { useState } from "react";
import { Button } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf";
import GuardianMembersTable from "../tables/GuardianMembersTable";
import MemberDetailsSheet from "../modals/MemberDetailsSheet";
import SelectMemberModal from "../modals/SelectMemberModal"; // AGREGAR ESTE IMPORT
import { removeMemberFromGuardian, addMemberToGuardian } from "@/api/guardiansApi"; // AGREGAR addMemberToGuardian
import { toast } from "sonner";
import type { MemberBasicInfo } from "@/types/guardian.type";
import type { UpdateMember } from "@/types/member.type";
import { updateMember } from "@/api/membersApi";
import { Plus } from "lucide-react"; // AGREGAR ESTE IMPORT

interface MemberUpdate extends UpdateMember {
  member_id?: number;
  first_name?: string;
  last_name?: string;
}

interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  id?: string | number;
}

const MembersInCharge = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false); // AGREGAR ESTE ESTADO
  const [selectedMember, setSelectedMember] = useState<MemberBasicInfo | null>(null);
  const [isAdding, setIsAdding] = useState(false); // AGREGAR ESTE ESTADO

  const { user } = useAuth0();
  
  const guardianId = user?.sub ? parseInt(user.sub.replace('auth0|', '')) : undefined;
  const { members, loading, error, refetch } = useMembersInChargeOf(guardianId);
  
  const navigate = useNavigate();

  const handleViewMember = (member: MemberBasicInfo) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

  // AGREGAR ESTA FUNCIÓN
  const handleAddMembers = async (memberIds: number[]) => {
    if (!guardianId) {
      toast.error('No se pudo identificar el guardian');
      return;
    }

    setIsAdding(true);
    try {
      let successCount = 0;
      
      for (const memberId of memberIds) {
        try {
          await addMemberToGuardian(guardianId, memberId);
          successCount++;
        } catch (error) {
          console.error(`Error añadiendo miembro ${memberId}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} miembro(s) añadido(s) exitosamente`);
        if (refetch) {
          await refetch();
        }
      }
      
    } catch (error) {
      toast.error('Error al añadir los miembros');
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditMember = async (member: UpdateMember) => {
    try {
      const memberData = member as MemberUpdate;
      const id = memberData.member_id ?? memberData.memberId;

      if (!id) {
        toast.error("No se encontró el ID del miembro");
        return;
      }

      const currentPhone = member.phone ?? "";
      const newPhone = window.prompt("Nuevo teléfono del miembro:", currentPhone);
      if (newPhone == null || newPhone === currentPhone) return;

      await updateMember(String(id), { phone: newPhone });

      toast.success("Miembro actualizado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar el miembro");
    }
  };

  const handleDeleteMember = async (member: MemberBasicInfo) => {
    try {
      if (!guardianId) {
        toast.error('No se pudo identificar el guardian');
        return;
      }

      const extendedMember = member as ExtendedMemberInfo;
      const memberId = extendedMember.memberId || 
                          extendedMember.member_id || 
                          extendedMember.userId || 
                          extendedMember.id;
      if (!memberId) {
        toast.error('No se pudo identificar el miembro');
        return;
      }

      console.log('Removing member from guardian:', { guardianId, memberId });
      
      await removeMemberFromGuardian(guardianId, memberId);
      
      toast.success('Miembro removido exitosamente del guardian');
      
      if (refetch) {
        await refetch();
      }
      
    } catch (error) {
      console.error('Error removing member from guardian:', error);
      toast.error('Error al remover el miembro del guardian');
      throw error;
    }
  };

  if (loading) {
    return <div>Cargando miembros...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalMembers = members.length;

  return (
    <>
      <div className="mx-4">
        <header className="flex items-center mb-4 justify-between">
          <p className="text-5xl font-bold text-primary">
            Miembros a Cargo
          </p>
          {/* AGREGAR ESTE BOTÓN */}
          <Button
            variant="primary"
            onClick={() => setIsSelectModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Añadir Miembro
          </Button>
        </header>

        <section className="mt-6">
          {!loading && !error && (
            <GuardianMembersTable 
              filteredMembers={members} 
              onViewMember={handleViewMember}
              onDeleteMember={handleDeleteMember}
              onEditMember={handleEditMember}
            />
          )}

          <section className="flex justify-between items-center mt-4">
            <div className="flex justify-start mt-3 gap-2">
              <Button
                variant="primary"
                onClick={() => navigate("/app/guardians/profile")}
              >
                Mi Perfil
              </Button>
              <p className="text-sm text-text self-center ml-4">
                Mostrando {totalMembers} miembros
              </p>
            </div>
          </section>
        </section>
      </div>

      <MemberDetailsSheet
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        member={selectedMember}
      />

      {/* AGREGAR ESTE MODAL */}
      <SelectMemberModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onConfirm={handleAddMembers}
        isAdding={isAdding}
      />
    </>
  );
};

export default MembersInCharge;
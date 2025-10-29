import { useState } from "react";
import { Button } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf";
import GuardianMembersTable from "../tables/GuardianMembersTable";
import MemberDetailsSheet from "../modals/MemberDetailsSheet";
import { removeMemberFromGuardian } from "@/api/guardiansApi";
import { toast } from "sonner";
import type { MemberBasicInfo } from "@/types/guardian.type";
import type { UpdateMember } from "@/types/member.type";
import EditMemberModal from "../modals/EditMemberModal";


interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  id?: string | number;
}

const MembersInCharge = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberBasicInfo | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<UpdateMember | null>(null);

  const { user } = useAuth0();
  console.log("Usuario completo:", user);
  console.log("user.sub:", user?.sub);

  
  const guardianId = user?.sub ? parseInt(user.sub.replace('auth0|', '')) : undefined;
  console.log("Guardian ID calculado:", guardianId);
  const { members, loading, error, refetch } = useMembersInChargeOf(guardianId);
  
    // TEMPORAL: Ver estructura real de los datos
  console.log("Miembros cargados:", members);
  console.log("Primer miembro:", members[0]);
  

  const navigate = useNavigate();

  const handleViewMember = (member: MemberBasicInfo) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };


    const handleEditMember = (member: UpdateMember) => {
    setMemberToEdit(member);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    // Refrescar la lista después de editar
    if (refetch) {
      await refetch();
    }
  };

  const handleDeleteMember = async (member: MemberBasicInfo) => {
    try {
      if (!guardianId) {
        toast.error('No se pudo identificar el guardian');
        return;
      }

      // Obtener el ID del miembro de diferentes posibles campos
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
      
      // Llamar al endpoint para remover el miembro del guardian
      await removeMemberFromGuardian(guardianId, memberId);
      
      toast.success('Miembro removido exitosamente del guardian');
      
      // Recargar la lista de miembros
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
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        miembro={memberToEdit}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default MembersInCharge;
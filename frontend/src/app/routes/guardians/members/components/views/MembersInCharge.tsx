import { useState } from "react";
import { Button } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf";
import GuardianMembersTable from "../tables/GuardianMembersTable";
import MemberDetailsSheet from "../modals/MemberDetailsSheet";
import SelectMemberModal from "../modals/SelectMemberModal";
import ReassignGuardianModal from "../modals/ReassignGuardianModal"; 
import { removeMemberFromGuardian, addMemberToGuardian, reassignMemberGuardian } from "@/api/guardiansApi"; 
import type { MemberBasicInfo } from "@/types/guardian.type";
import type { UpdateMember } from "@/types/member.type";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import EditMemberModal from "../modals/EditMemberModal";
import { AxiosError } from "axios";

interface ExtendedMemberInfo extends MemberBasicInfo {
  member_id?: string | number;
  userId?: string | number;
  id?: string | number;
}

const MembersInCharge = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberBasicInfo | null>(null);
  const [memberToReassign, setMemberToReassign] = useState<MemberBasicInfo | null>(null); 
  const [isAdding, setIsAdding] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<UpdateMember | null>(null);
  
  const { user } = useAuth0();
  
  const guardianId = user?.sub ? parseInt(user.sub.replace('auth0|', '')) : undefined;
  const { members, loading, error, refetch } = useMembersInChargeOf(guardianId);
  
  const navigate = useNavigate();

  const handleViewMember = (member: MemberBasicInfo) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

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

  const handleEditMember = (member: UpdateMember) => {
    setMemberToEdit(member);
    setIsEditModalOpen(true);
  };

  const handleReassignGuardian = (member: MemberBasicInfo) => {
    setMemberToReassign(member);
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassign = async (memberId: number, newGuardianId: number, currentGuardianId: number) => {
    
    setIsReassigning(true);
    
    try {
      await reassignMemberGuardian(currentGuardianId, memberId, newGuardianId);
      
      toast.success('Miembro reasignado exitosamente');
      
      if (refetch) {
        await refetch();
      }
      
    } catch (error: unknown) {
      
      if (error instanceof AxiosError) {
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        
        const errorMessage = error.response?.data || 'Error al reasignar el miembro';
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error('Error al reasignar el miembro');
      }
      
      throw error;
    } finally {
      setIsReassigning(false);
    }
  };

  const handleEditSuccess = async () => {
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

      const extendedMember = member as ExtendedMemberInfo;
      const memberId = extendedMember.memberId || 
                          extendedMember.member_id || 
                          extendedMember.userId || 
                          extendedMember.id;
      if (!memberId) {
        toast.error('No se pudo identificar el miembro');
        return;
      }
      
      await removeMemberFromGuardian(guardianId, memberId);
      
      toast.success('Miembro removido exitosamente del guardian');
      
      if (refetch) {
        await refetch();
      }
      
    } catch (error) {
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
              onReassignGuardian={handleReassignGuardian}
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

      <SelectMemberModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onConfirm={handleAddMembers}
        isAdding={isAdding}
      />

      <ReassignGuardianModal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setMemberToReassign(null);
        }}
        member={memberToReassign}
        onConfirm={handleConfirmReassign}
        isReassigning={isReassigning}
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
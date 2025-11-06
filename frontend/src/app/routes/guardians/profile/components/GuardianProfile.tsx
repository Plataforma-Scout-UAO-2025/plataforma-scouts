import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProfileHeader from '@/app/routes/guardians/profile/components/ProfileHeader';
import ProfileInfoCard from '@/app/routes/guardians/profile/components/ProfileInfoCard';
import MembersInChargeCard from '@/app/routes/guardians/profile/components/MembersInChargeCard';
import GroupInfoCard from '@/app/routes/guardians/profile/components/GroupInfoCard';
import EditProfileModal from '@/app/routes/guardians/profile/components/EditProfileModal';
import MemberDetailsSheet from '@/app/routes/guardians/members/components/modals/MemberDetailsSheet';
import { guardianService } from '@/app/routes/guardians/services/guardianService';
import { useGuardianMemberId } from '@/app/routes/guardians/hooks/useGuardianMemberId';
import { useMembersInChargeOf } from '@/hooks/useMembersInChargeOf';
import type { UpdateGuardianDTO, Guardian, MemberBasicInfo } from '@/types/guardian.type';
import FullScreenLoader from '@/components/common/FullScreenLoader';

// Interfaz para manejar diferentes formatos de ID en miembros
interface ExtendedMemberInfo extends MemberBasicInfo {
  user_id?: string | number;
  member_id?: string | number;
}

const GuardianProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberBasicInfo | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [guardianApiData, setGuardianApiData] = useState<Guardian | null>(null);

  // Obtener guardianId usando el hook
  const { memberId: guardianId } = useGuardianMemberId();
  
  // Usar el hook optimizado para obtener miembros a cargo
  const { members: membersInCharge, loading, error } = useMembersInChargeOf(guardianId);
  
  useEffect(() => {
    if (guardianId) {
      guardianService.getGuardianById(guardianId)
        .then((response) => {
          setGuardianApiData(response);
        })
        .catch((err) => {
          console.error("Error al obtener datos del acudiente:", err);
        });
    }
  }, [guardianId]);

  const handleEditProfile = async (data: unknown) => {
    try {
      if (!guardianId) {
        toast.error('No se pudo identificar el guardian');
        return;
      }
      const updateData: UpdateGuardianDTO = {
        ...(data as Record<string, unknown>),
        documentType: (data as Record<string, unknown>).documentType as UpdateGuardianDTO['documentType']
      };
      
      await guardianService.updateData(guardianId, updateData);
      toast.success('Perfil actualizado exitosamente');
      setIsEditModalOpen(false);
      
      // Recargar datos del guardian después de la actualización
      const updatedGuardian = await guardianService.getGuardianById(guardianId);
      setGuardianApiData(updatedGuardian);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('No se pudo actualizar el perfil');
    }
  };

  const handleViewMemberProfile = (id: number) => {
    const member = membersInCharge.find(m => {
      const extendedMember = m as ExtendedMemberInfo;
      const memberId = extendedMember.memberId || extendedMember.user_id || extendedMember.member_id;
      return memberId === id.toString() || 
             memberId === id || 
             parseInt(String(memberId)) === id;
    });
    
    if (member) {
      setSelectedMember(member);
      setIsDetailsSheetOpen(true);
    } else {
      toast.error('No se encontró información del miembro');
    }
  };

  // Manejo de estados de carga y error
  if (loading) {
    return <FullScreenLoader message="Cargando perfil..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/app/dashboard')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!guardianId) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a4134] mb-4">No se encontró el perfil</h2>
          <p className="text-gray-600 mb-4">No se pudo obtener la información de autenticación</p>
          <Button onClick={() => navigate('/app/dashboard')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Mapear miembros a cargo para el componente
  const miembrosACargo = membersInCharge
    .filter(member =>
      member.first_name &&
      member.last_name &&
      member.first_name.trim() !== "" &&
      member.last_name.trim() !== ""
    )
    .map(member => {
      // Manejar diferentes formatos de ID
      const extendedMember = member as ExtendedMemberInfo;
      const memberId = extendedMember.memberId || extendedMember.user_id || extendedMember.member_id;
      
      return {
        id: typeof memberId === 'string' ? parseInt(memberId) || 0 : memberId || 0,
        fullName: `${member.first_name ?? ''} ${member.last_name ?? ''}`,
        rama: member.subgroup?.name ?? 'Sin asignar',
        parentesco: member.relationship ?? 'No especificado',
        isActive: member.is_active ?? false
      };
    });

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <div className="flex flex-col min-h-screen">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')} className="hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-[#1a4134]">Mi Perfil</h1>
          </div>
          <Button onClick={() => setIsEditModalOpen(true)} className="bg-[#1a4134] hover:bg-[#143828] text-white">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
        
        <div className="flex-1 p-6">
          <ProfileHeader 
            first_name={guardianApiData?.firstName || ''} 
            last_name={guardianApiData?.lastName || ''} 
            grupo={guardianApiData?.role || ''} 
            is_active={guardianApiData?.is_active || false} 
          />
          
          <ProfileInfoCard
            address={guardianApiData?.address || ''} 
            first_name={guardianApiData?.firstName || ''} 
            last_name={guardianApiData?.lastName || ''} 
            identification={guardianApiData?.identification || ''} 
            documentType={guardianApiData?.document_type || 'CC'} 
            email={user?.email || 'N/A'} 
            phone={guardianApiData?.phone || ''} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
            <MembersInChargeCard 
              miembrosACargo={miembrosACargo} 
              onViewMember={handleViewMemberProfile} 
            />
            <GroupInfoCard
              role={'Acudiente'}
              joinDate={guardianApiData?.acceptance_date || ''}
              isActive={guardianApiData?.is_active || false}
            />            
          </div>
        </div>
      </div>
      
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleEditProfile} 
        initialData={{
          firstName: guardianApiData?.firstName || user?.nickname || '',
          lastName: guardianApiData?.lastName || '',
          identification: guardianApiData?.identification || '',
          documentType: guardianApiData?.document_type || 'CC',
          email: user?.email ?? 'N/A',
          emailAlt: undefined,
          phone: guardianApiData?.phone || '',
          phoneAlt: undefined,
          address: guardianApiData?.address || ''
        }} 
      />
      
      <MemberDetailsSheet 
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        member={selectedMember}
      />
    </div>
  );
};

export default GuardianProfilePage;
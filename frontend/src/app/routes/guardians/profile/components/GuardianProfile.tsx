import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProfileHeader from './ProfileHeader';
import ProfileInfoCard from './ProfileInfoCard';
import MembersInChargeCard from './MembersInChargeCard';
import EditProfileModal from './EditProfileModal';
import MemberDetailsSheet from '../../members/components/modals/MemberDetailsSheet';
import { guardianService } from '../../services/guardianService';
import { useMembersInChargeOf } from '@/hooks/useMembersInChargeOf';
import { useGuardian } from '@/hooks/useGuardian';
import type { Member } from '../../members/types/member.type';
import type { UpdateGuardianDTO } from '@/types/guardian.type';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';

const GuardianProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // Usar el hook optimizado para obtener miembros a cargo
  const { members: membersInCharge, loading, error, guardianId } = useMembersInChargeOf(309);
  
  // Obtener datos del guardian actual
  const guardianState = useGuardian();
  const guardianData = guardianState.member || null;

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
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('No se pudo actualizar el perfil');
    }
  };

  const handleViewMemberProfile = (id: number) => {
    const member = membersInCharge.find(m => m.userId === id.toString());
    if (member) {
      // Mapeo de DocumentType
      const mapDocumentType = (docType?: string): Member['documentType'] => {
        if (docType === 'PASSPORT') return 'PA';
        return (docType as Member['documentType']) || 'CC';
      };
      
      // Convertir MemberBasicInfo a Member para compatibilidad
      const memberData: Member = {
        id: parseInt(member.userId || '0'),
        firstName: member.firstName || '', // Nota: usar first_name del backend
        lastName: member.lastName || '',   // Nota: usar last_name del backend
        identification: member.identification || '',
        documentType: mapDocumentType(member.documentType),
        phone: member.phone || '',
        isActive: member.isActive || false,
        birthDate: member.birthDate || '', // Nota: usar birth_date del backend
        age: member.age,
        gender: (member.gender as Member['gender']) || 'OTHER',
        city: '',
        rama: member.subgroup?.name || '',
        role: '',
        email: '',
        address: '',
        acceptanceDate: '',
        createdAt: '',
        emergencyContacts: (member.emergencyContacts || []).map(ec => ({
          id: 0,
          fullName: ec.name || '',
          relationship: (ec.relationship as Member['emergencyContacts'][0]['relationship']) || 'Otro',
          phone: ec.phone || ''
        }))
      };
      setSelectedMember(memberData);
      setIsDetailsSheetOpen(true);
    } else {
      toast.error('No se encontró información del miembro');
    }
  };

  const handleEditMember = (member: Member) => {
    console.log('Editing member:', member);
    setIsDetailsSheetOpen(false);
    toast.info('Funcionalidad de edición en desarrollo');
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
          <Button onClick={() => navigate('/app/dashboard')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Mapear miembros a cargo para el componente
  const miembrosACargo = membersInCharge.map(member => ({
    id: parseInt(member.userId || '0'),
    fullName: `${member.firstName || ''} ${member.lastName || ''}`, // Usar campos del backend
    rama: member.subgroup?.name || 'Sin asignar',
    parentesco: member.relationship || 'No especificado',
    isActive: member.isActive || false
  }));

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <div className="flex flex-col min-h-screen">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
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
            firstName={guardianData?.firstName ?? user?.nickname ?? ''} 
            lastName={guardianData?.lastName ?? user?.middle_name ?? ''} 
            grupo={guardianData?.subgroup?.name ?? ''} 
            isActive={guardianData?.isActive || false} 
          />
          <ProfileInfoCard 
            firstName={guardianData?.firstName ?? user?.nickname ?? ''} 
            lastName={guardianData?.lastName ?? user?.middle_name ?? ''} 
            identification={guardianData?.identification || ''} 
            documentType={guardianData?.documentType || 'CC'} 
            email={user?.email ?? 'N/A'} 
            emailAlt={undefined} 
            phone={guardianData?.phone || ''} 
            phoneAlt={undefined} 
            address={'N/A'} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <MembersInChargeCard 
              miembrosACargo={miembrosACargo} 
              grupo={guardianData?.subgroup?.name || 'Sin grupo'} 
              role={'Acudiente'} 
              joinDate={guardianData?.acceptanceDate || ''} 
              isActive={guardianData?.isActive || false} 
              onViewMember={handleViewMemberProfile} 
            />
          </div>
        </div>
      </div>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleEditProfile} 
        initialData={{
          firstName: guardianData?.firstName ?? user?.nickname ?? '',
          lastName: guardianData?.lastName || '',
          identification: guardianData?.identification || '',
          documentType: guardianData?.documentType || 'CC',
          email: user?.email ?? 'N/A',
          emailAlt: undefined,
          phone: guardianData?.phone || '',
          phoneAlt: undefined,
          address: 'N/A'
        }} 
      />
      <MemberDetailsSheet 
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        miembro={selectedMember}
        onEdit={handleEditMember}
      />
    </div>
  );
};

export default GuardianProfilePage;
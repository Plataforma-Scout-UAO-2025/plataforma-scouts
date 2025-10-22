import React, { useState, useEffect } from 'react';
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
import type { Member } from '../../members/types/member.type';
import type { GuardianWithMembers, UpdateGuardianDTO, MemberBasicInfo } from '@/types/guardianTypes';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { getErrorStatus } from '@/lib/errorUtils';

const GuardianProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [guardianData, setGuardianData] = useState<GuardianWithMembers | null>(null);
  const [membersInCharge, setMembersInCharge] = useState<MemberBasicInfo[]>([]);

  // ⚠️ IMPORTANTE: guardianId está hardcodeado temporalmente
  // TODO: Obtener el guardianId del usuario actual logueado
  // Opciones:
  // 1. Crear endpoint: GET /api/v1/guardian/by-user-id/{userId}
  // 2. Incluir guardianId en el token JWT de Auth0
  // 3. Llamar a un endpoint que mapee userId -> guardianId

    const guardianId = 309;
    const { user } = useAuth0();
    

  useEffect(() => {
    const fetchGuardianData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del guardian con sus miembros
        const guardianWithMembers = await guardianService.getGuardianWithMembers(guardianId);
        
        if (guardianWithMembers) {
          setGuardianData(guardianWithMembers);
          
          // Obtener lista completa de miembros a cargo
          const members = await guardianService.getMembersInChargeOf(guardianId);
          setMembersInCharge(members || []);
        }
      } catch (error: unknown) {
        console.error('Error al cargar datos del guardian:', error);
        
        // Mensaje específico según el tipo de error
        const status = getErrorStatus(error);
        if (status === 404) {
          toast.error(`Guardian con ID ${guardianId} no encontrado. Por favor contacta al administrador.`);
        } else if (status === 401 || status === 403) {
          toast.error('No tienes permisos para ver este perfil');
        } else {
          toast.error('No se pudieron cargar los datos del perfil. Intenta nuevamente.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuardianData();
  }, [guardianId]);

  const handleEditProfile = async (data: unknown) => {
    try {
      // El modal devuelve strings, necesitamos convertirlos al formato correcto
      const updateData: UpdateGuardianDTO = {
        ...(data as Record<string, unknown>),
        documentType: (data as Record<string, unknown>).documentType as UpdateGuardianDTO['documentType']
      };
      
      await guardianService.updateData(guardianId, updateData);
      
      // Actualizar estado local
      setGuardianData(prev => prev ? { ...prev, ...updateData } : null);
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
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        identification: member.identification || '',
        documentType: mapDocumentType(member.documentType),
        phone: member.phone || '',
        isActive: member.isActive || false,
        birthDate: member.birthDate || '',
        age: member.age,
        gender: (member.gender as Member['gender']) || 'OTHER',
        city: '', // No disponible en MemberBasicInfo
        rama: member.subgroup?.name || '', // No disponible en MemberBasicInfo
        role: '', // No disponible en MemberBasicInfo
        email: '', // No disponible en MemberBasicInfo
        address: '', // No disponible en MemberBasicInfo
        acceptanceDate: '', // No disponible en MemberBasicInfo
        createdAt: '', // No disponible en MemberBasicInfo
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

  if (isLoading) {
    return <FullScreenLoader message="Cargando perfil..." />;
  }

  if (!guardianData) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a4134] mb-4">No se encontró el perfil</h2>
          <Button onClick={() => navigate('/app/dashboard')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Convertir miembros a formato esperado por el componente
  const miembrosACargo = guardianData.members?.map(member => ({
    id: parseInt(member.userId || '0'),
    fullName: `${member.firstName || ''} ${member.lastName || ''}`,
    rama: member.subgroup?.name || 'Sin asignar',
    parentesco: member.relationship || 'No especificado',
    isActive: member.isActive || false
  })) || [];

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
            firstName={guardianData.firstName ?? user?.nickname ?? ''} 
            lastName={guardianData.lastName ?? user?.middle_name ??''} 
            grupo={guardianData.subgroup?.name ?? ''} 
            isActive={guardianData.isActive || false} 
          />
          <ProfileInfoCard 
            firstName={guardianData.firstName ?? user?.nickname ?? ''} 
            lastName={guardianData?.lastName ?? user?.middle_name ?? ''} 
            identification={guardianData.identification || ''} 
            documentType={guardianData.documentType || 'CC'} 
            email={user?.email ?? 'N/A'} 
            emailAlt={undefined} 
            phone={guardianData.phone || ''} 
            phoneAlt={undefined} 
            address={'N/A'} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <MembersInChargeCard 
              miembrosACargo={miembrosACargo} 
              grupo={guardianData.subgroup?.name || 'Sin grupo'} 
              role={'Acudiente'} 
              joinDate={guardianData.acceptanceDate || ''} 
              isActive={guardianData.isActive || false} 
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
          firstName: guardianData.firstName ?? user?.nickname ?? '',
          lastName: guardianData.lastName || '',
          identification: guardianData.identification || '',
          documentType: guardianData.documentType || 'CC',
          email: user?.email ?? 'N/A',
          emailAlt: undefined,
          phone: guardianData.phone || '',
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

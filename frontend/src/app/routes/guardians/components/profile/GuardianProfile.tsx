import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Sidebar from '../layouts/Sidebar';
import ProfileHeader from './ProfileHeader';
import ProfileInfoCard from './ProfileInfoCard';
import MembersInChargeCard from './MembersInChargeCard';
import EditProfileModal from './EditProfileModal';

interface MembersInCharge {
  id: number;
  fullName: string;
  rama: string;
  parentesco: string;
  isActive: boolean;
}

interface GuardianProfile {
  firstName: string;
  lastName: string;
  identification: string;
  documentType: string;
  email: string;
  emailAlt?: string;
  phone: string;
  phoneAlt?: string;
  address: string;
  grupo: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  miembrosACargo: MembersInCharge[];
}

const GuardianProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [guardianData, setGuardianData] = useState<GuardianProfile>({
    firstName: "Juan Esteban",
    lastName: "Torres",
    identification: "1001002003",
    documentType: "CC",
    email: "juan.torres@email.com",
    emailAlt: "juan.torres.alt@email.com",
    phone: "+573101234567",
    phoneAlt: "+573209876543",
    address: "Calle 10 # 20-30, Cali",
    grupo: "MANADA KUNA",
    role: "Acudiente",
    joinDate: "2020-01-15",
    isActive: true,
    miembrosACargo: [
      { id: 1, fullName: "José Alberto Gutierrez", rama: "Lobatos", parentesco: "hijo", isActive: true },
      { id: 2, fullName: "Ana María López", rama: "Lobatos", parentesco: "hija", isActive: true },
      { id: 3, fullName: "Luis Fernando Martínez", rama: "Scouts", parentesco: "sobrino", isActive: true }
    ]
  });

  const handleEditProfile = (data: any) => {
    setGuardianData({ ...guardianData, ...data });
    toast.success('Perfil actualizado exitosamente');
  };

  const handleViewMemberProfile = (id: number) => {
    navigate(`/guardians/members/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Sidebar activeRoute="inicio" />
      <div className="ml-72 flex flex-col min-h-screen">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guardians')} className="hover:bg-gray-100">
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
            firstName={guardianData.firstName} 
            lastName={guardianData.lastName} 
            grupo={guardianData.grupo} 
            isActive={guardianData.isActive} 
          />
          <ProfileInfoCard 
            firstName={guardianData.firstName} 
            lastName={guardianData.lastName} 
            identification={guardianData.identification} 
            documentType={guardianData.documentType} 
            email={guardianData.email} 
            emailAlt={guardianData.emailAlt} 
            phone={guardianData.phone} 
            phoneAlt={guardianData.phoneAlt} 
            address={guardianData.address} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <MembersInChargeCard 
              miembrosACargo={guardianData.miembrosACargo} 
              grupo={guardianData.grupo} 
              role={guardianData.role} 
              joinDate={guardianData.joinDate} 
              isActive={guardianData.isActive} 
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
          firstName: guardianData.firstName,
          lastName: guardianData.lastName,
          identification: guardianData.identification,
          documentType: guardianData.documentType,
          email: guardianData.email,
          emailAlt: guardianData.emailAlt,
          phone: guardianData.phone,
          phoneAlt: guardianData.phoneAlt,
          address: guardianData.address
        }} 
      />
    </div>
  );
};

export default GuardianProfilePage;

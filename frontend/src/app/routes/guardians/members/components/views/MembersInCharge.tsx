import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MembersTable from '../tables/MembersTable';
import MemberDetailsSheet from '../modals/MemberDetailsSheet';
import EditMemberModal from '../modals/EditMemberModal';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { guardianService } from '../../../services/guardianService';
import type { Member } from '../../types/member.type';
import type { MemberFormData } from '../../schemas/MemberForm.schema';
import { getErrorStatus } from '@/lib/errorUtils';

export default function MembersInCharge() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [miembros, setMiembros] = useState<Member[]>([]);
  const [selectedMiembro, setSelectedMiembro] = useState<Member | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ⚠️ IMPORTANTE: guardianId está hardcodeado temporalmente
  // TODO: Obtener el guardianId del usuario actual logueado
  // Opciones:
  // 1. Crear endpoint: GET /api/v1/guardian/by-user-id/{userId}
  // 2. Incluir guardianId en el token JWT de Auth0
  // 3. Llamar a un endpoint que mapee userId -> guardianId
  const guardianId = 309;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const members = await guardianService.getMembersInChargeOf(guardianId);
        
        // Mapear DocumentType del backend al frontend
        const mapDocumentType = (docType?: string): Member['documentType'] => {
          if (docType === 'PASSPORT') return 'PA';
          return (docType as Member['documentType']) || 'CC';
        };
        
        // Convertir MemberBasicInfo[] a Member[] para compatibilidad con el componente
        const membersData: Member[] = (members || []).map(m => ({
          id: parseInt(m.userId || '0'),
          firstName: m.firstName || '',
          lastName: m.lastName || '',
          identification: m.identification || '',
          documentType: mapDocumentType(m.documentType),
          phone: m.phone || '',
          isActive: m.isActive || false,
          birthDate: m.birthDate || '',
          age: m.age,
          gender: (m.gender as Member['gender']) || 'OTHER',
          city: '', // No disponible en MemberBasicInfo
          rama: m.subgroup?.name || '', 
          role: '', // No disponible en MemberBasicInfo
          email: '', // No disponible en MemberBasicInfo
          address: '', // No disponible en MemberBasicInfo
          acceptanceDate: '', // No disponible en MemberBasicInfo
          createdAt: '', // No disponible en MemberBasicInfo
          emergencyContacts: (m.emergencyContacts || []).map(ec => ({
            id: 0,
            fullName: ec.name || '',
            relationship: (ec.relationship as Member['emergencyContacts'][0]['relationship']) || 'Otro',
            phone: ec.phone || ''
          }))
        }));
        
        setMiembros(membersData);
      } catch (error: unknown) {
        console.error('Error al cargar miembros:', error);

        // Mensaje específico según el tipo de error
        const status = getErrorStatus(error);
        if (status === 404) {
          toast.error(`No se encontraron miembros para el guardian con ID ${guardianId}. Puedes agregar nuevos miembros.`);
        } else if (status === 401 || status === 403) {
          toast.error('No tienes permisos para ver estos miembros');
        } else {
          toast.error('No se pudieron cargar los miembros a cargo. Intenta nuevamente.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [guardianId]);

  const handleViewDetails = (miembro: Member) => {
    setSelectedMiembro(miembro);
    setIsDetailsSheetOpen(true);
  };

  const handleEdit = (miembro: Member) => {
    setSelectedMiembro(miembro);
    setIsEditModalOpen(true);
    setIsDetailsSheetOpen(false);
  };

  const handleSaveEdit = (data: MemberFormData) => {
    if (!selectedMiembro) return;

    const updatedMiembro: Member = {
      ...selectedMiembro,
      ...data,
    };

    setMiembros(prev => 
      prev.map(m => m.id === selectedMiembro.id ? updatedMiembro : m)
    );
    
    setSelectedMiembro(null);
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return <FullScreenLoader message="Cargando miembros a cargo..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Miembros a Cargo
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualiza y gestiona los miembros scouts que tienes bajo tu responsabilidad
          </p>
        </div>
        <Button
          onClick={() => navigate('/app/inscripcion')}
          className="bg-[#1a4134] hover:bg-[#1a4134]/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Miembro
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <MembersTable
          members={miembros}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      </div>

      <MemberDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        miembro={selectedMiembro}
        onEdit={handleEdit}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMiembro(null);
        }}
        miembro={selectedMiembro}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MembersTable from '../tables/MembersTable';
import MemberDetailsSheet from '../modals/MemberDetailsSheet';
import EditMemberModal from '../modals/EditMemberModal';
import type { Member } from '../../types/member.type';
import type { MemberFormData } from '../../schemas/MemberForm.schema';
import { mockMembersData } from '../../../shared/mockData';

export default function MembersInCharge() {
  const navigate = useNavigate();
  const [miembros, setMiembros] = useState<Member[]>(mockMembersData);
  const [selectedMiembro, setSelectedMiembro] = useState<Member | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          onClick={() => navigate('/inscripcion')}
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

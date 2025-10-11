import { useState } from 'react';
import MembersTable from '@/app/routes/guardians/members/components/tables/MembersTable';
import MemberDetailsSheet from '@/app/routes/guardians/members/components/modals/MemberDetailsSheet';
import EditMemberModal from '@/app/routes/guardians/members/components/modals/EditMemberModal';
import type { Member } from '@/app/routes/guardians/members/types/member.type';
import type { MemberFormData } from '@/app/routes/guardians/members/schemas/MemberForm.schema';
import { mockMembersData } from '@/app/routes/guardians/shared/mockData';

/**
 * AcudienteView - Dashboard principal para acudientes
 * Muestra la tabla de miembros a cargo del acudiente
 */
const AcudienteView = () => {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Miembros a Cargo
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y gestiona los miembros scouts que tienes bajo tu responsabilidad
        </p>
      </div>

      {/* Tabla de miembros */}
      <div className="bg-white rounded-lg shadow-sm border">
        <MembersTable
          members={miembros}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      </div>

      {/* Sheet de detalles */}
      <MemberDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        miembro={selectedMiembro}
        onEdit={handleEdit}
      />

      {/* Modal de edición */}
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

export default AcudienteView;

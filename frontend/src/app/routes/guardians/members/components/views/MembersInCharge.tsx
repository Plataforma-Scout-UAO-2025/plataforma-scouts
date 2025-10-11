import { useState } from 'react';
import MembersTable from '../tables/MembersTable';
import MemberDetailsSheet from '../modals/MemberDetailsSheet';
import EditMemberModal from '../modals/EditMemberModal';
import type { Member } from '../../types/member.type';
import type { MemberFormData } from '../../schemas/MemberForm.schema';
import { mockMembersData } from '../../../shared/mockData';

/**
 * MembersInCharge - Vista de tabla de miembros a cargo
 * Muestra la tabla de miembros del acudiente con opciones de visualización y edición
 */
export default function MembersInCharge() {
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

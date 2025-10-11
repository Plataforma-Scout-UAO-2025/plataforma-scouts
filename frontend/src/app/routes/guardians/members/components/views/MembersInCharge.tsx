import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import MembersTable from '../tables/MembersTable';
import MemberDetailsSheet from '../modals/MemberDetailsSheet';
import EditMemberModal from '../modals/EditMemberModal';
import type { Member } from '../../types/member.type';
import type { MemberFormData } from '../../schemas/MemberForm.schema';

// Datos de ejemplo
const membersExample: Member[] = [
  {
    id: 1,
    firstName: "José Alberto",
    lastName: "Gutierrez Jimenez",
    email: "jose.gutierrez@email.com",
    documentType: "CC",
    identification: "CC 1123123123010",
    gender: "MALE",
    birthDate: "2010-03-14",
    phone: "+57 312 345 6789",
    address: "Calle 5 # 10-20, Cali",
    role: "Scout Aspirante",
    acceptanceDate: "2025-01-15",
    isActive: true,
    weight: "45 kg",
    height: "1.55 m",
    hobbies: "Dibujar, Leer, Tocar Guitarra",
    sports: "Voleibol",
    instruments: "Guitarra",
    emergencyContacts: [
      {
        id: 1,
        fullName: "María Gómez",
        relationship: "Madre",
        phone: "+57 310 987 6543"
      },
      {
        id: 2,
        fullName: "Carlos Rojas",
        relationship: "Padre",
        phone: "+57 300 112 2334"
      }
    ],
    createdAt: "2025-08-13T16:30:00",
    city: "Cali",
    rama: "Lobatos",
  },
  {
    id: 2,
    firstName: "Ana María",
    lastName: "López Hernández",
    email: "ana.lopez@email.com",
    documentType: "TI",
    identification: "TI 1098765432",
    gender: "FEMALE",
    birthDate: "2011-07-22",
    phone: "+57 315 678 9012",
    address: "Carrera 12 # 25-30, Cali",
    role: "Scout Aspirante",
    acceptanceDate: "2025-02-01",
    isActive: true,
    weight: "40 kg",
    height: "1.50 m",
    hobbies: "Natación, Pintura",
    sports: "Natación",
    instruments: "Piano",
    emergencyContacts: [
      {
        id: 3,
        fullName: "Patricia Hernández",
        relationship: "Madre",
        phone: "+57 314 555 7777"
      }
    ],
    createdAt: "2025-08-15T10:15:00",
    city: "Cali",
    rama: "Lobatos",
  },
  {
    id: 3,
    firstName: "Luis Fernando",
    lastName: "Martínez Silva",
    email: "luis.martinez@email.com",
    documentType: "CC",
    identification: "CC 1087654321",
    gender: "MALE",
    birthDate: "2009-11-08",
    phone: "+57 318 456 7890",
    address: "Avenida 6 # 15-45, Cali",
    role: "Scout",
    acceptanceDate: "2024-09-10",
    isActive: true,
    weight: "50 kg",
    height: "1.60 m",
    hobbies: "Fútbol, Lectura, Videojuegos",
    sports: "Fútbol",
    instruments: "Flauta",
    emergencyContacts: [
      {
        id: 4,
        fullName: "Roberto Martínez",
        relationship: "Padre",
        phone: "+57 300 888 9999"
      },
      {
        id: 5,
        fullName: "Sandra Silva",
        relationship: "Madre",
        phone: "+57 311 777 8888"
      }
    ],
    createdAt: "2024-09-10T14:20:00",
    city: "Cali",
    rama: "Scouts",
  }
];

export default function MiembrosACargo() {
  const [miembros, setMiembros] = useState<Member[]>(membersExample);
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
    setIsDetailsSheetOpen(false); // Cerrar detalles si está abierto
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

  const handleGoBack = () => {
    // Aquí navegarías a la vista anterior
    console.log('Navegando hacia atrás...');
  };

  return (
    <div className="flex h-screen bg-[#fffaf3]">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra "Área de trabajo" */}
        <div className="h-16 bg-[#fffaf3] border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-medium text-[#1a4134]">Área de trabajo</span>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Botón volver */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-[#1a4134] hover:bg-[#1a4134]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
            </div>

            {/* Header de la vista */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1a4134] mb-3">
                Miembros a Cargo
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                Visualiza y gestiona los miembros scouts que tienes bajo tu responsabilidad como acudiente. 
                Aquí puedes ver su información, editar sus datos y consultar su progreso en la tropa.
              </p>
            </div>

            {/* Tabla de miembros */}
            <div className="bg-white rounded-lg shadow-sm">
              <MembersTable
                members={miembros}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </main>
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
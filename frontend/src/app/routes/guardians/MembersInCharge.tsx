import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MembersTable from './components/MembersTable';
import MemberDetailsSheet from './components/MemberDetailsSheet';
import EditMemberModal from './components/EditMemberModal';
import type { Miembro } from './types/member.type';
import type { MiembroFormData } from './schemas/MemberForm.schema';

// Datos de ejemplo
const miembrosEjemplo: Miembro[] = [
  {
    id: 1,
    firstName: "José Alberto",
    lastName: "Gutierrez Jimenez",
    email: "jose.gutierrez@email.com",
    tipoDocumento: "CC",
    identification: "CC 1123123123010",
    genero: "Masculino",
    fechaNacimiento: "2010-03-14",
    telefono: "+57 312 345 6789",
    direccion: "Calle 5 # 10-20, Cali",
    rol: "Scout Aspirante",
    fechaAceptacion: "2025-01-15",
    isActive: true,
    peso: "45 kg",
    altura: "1.55 m",
    hobbies: "Dibujar, Leer, Tocar Guitarra",
    deportes: "Voleibol",
    instrumentos: "Guitarra",
    contactosEmergencia: [
      {
        id: 1,
        nombreCompleto: "María Gómez",
        relacion: "Madre",
        telefono: "+57 310 987 6543"
      },
      {
        id: 2,
        nombreCompleto: "Carlos Rojas",
        relacion: "Padre",
        telefono: "+57 300 112 2334"
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
    tipoDocumento: "TI",
    identification: "TI 1098765432",
    genero: "Femenino",
    fechaNacimiento: "2011-07-22",
    telefono: "+57 315 678 9012",
    direccion: "Carrera 12 # 25-30, Cali",
    rol: "Scout Aspirante",
    fechaAceptacion: "2025-02-01",
    isActive: true,
    peso: "40 kg",
    altura: "1.50 m",
    hobbies: "Natación, Pintura",
    deportes: "Natación",
    instrumentos: "Piano",
    contactosEmergencia: [
      {
        id: 3,
        nombreCompleto: "Patricia Hernández",
        relacion: "Madre",
        telefono: "+57 314 555 7777"
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
    tipoDocumento: "CC",
    identification: "CC 1087654321",
    genero: "Masculino",
    fechaNacimiento: "2009-11-08",
    telefono: "+57 318 456 7890",
    direccion: "Avenida 6 # 15-45, Cali",
    rol: "Scout",
    fechaAceptacion: "2024-09-10",
    isActive: true,
    peso: "50 kg",
    altura: "1.60 m",
    hobbies: "Fútbol, Lectura, Videojuegos",
    deportes: "Fútbol",
    instrumentos: "Flauta",
    contactosEmergencia: [
      {
        id: 4,
        nombreCompleto: "Roberto Martínez",
        relacion: "Padre",
        telefono: "+57 300 888 9999"
      },
      {
        id: 5,
        nombreCompleto: "Sandra Silva",
        relacion: "Madre",
        telefono: "+57 311 777 8888"
      }
    ],
    createdAt: "2024-09-10T14:20:00",
    city: "Cali",
    rama: "Scouts",
  }
];

export default function MiembrosACargo() {
  const [miembros, setMiembros] = useState<Miembro[]>(miembrosEjemplo);
  const [selectedMiembro, setSelectedMiembro] = useState<Miembro | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleViewDetails = (miembro: Miembro) => {
    setSelectedMiembro(miembro);
    setIsDetailsSheetOpen(true);
  };

  const handleEdit = (miembro: Miembro) => {
    setSelectedMiembro(miembro);
    setIsEditModalOpen(true);
    setIsDetailsSheetOpen(false); // Cerrar detalles si está abierto
  };

  const handleSaveEdit = (data: MiembroFormData) => {
    if (!selectedMiembro) return;

    const updatedMiembro: Miembro = {
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

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-[#fffaf3]">
      {/* Sidebar - Condicionalmente visible con transición */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-72' : 'w-0'} overflow-hidden`}>
        <Sidebar activeRoute="tropa" />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra "Área de trabajo" */}
        <div className="h-16 bg-[#fffaf3] border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              title={isSidebarVisible ? "Ocultar sidebar" : "Mostrar sidebar"}
            >
              <FolderOpen className="h-5 w-5 text-[#1a4134]" />
            </Button>
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
                miembros={miembros}
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
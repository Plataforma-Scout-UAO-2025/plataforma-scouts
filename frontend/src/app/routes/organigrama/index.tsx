import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RamaList from './components/RamaList';
import CreateRamaModal from './components/CreateRamaModal';
import CreateSubramaModal from './components/CreateSubramaModal';
import type { Rama } from './types/rama.type';
import type { CreateRamaFormData, CreateSubramaFormData } from './schemas/rama.schema';
import * as organigramaService from './services/organigrama.service';
import { availableYears } from './constants/mockData';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [selectedRamaId, setSelectedRamaId] = useState<string>('');

  // Cargar ramas al montar el componente y cuando cambie el año
  useEffect(() => {
    loadRamas();
  }, [selectedYear]);

  const loadRamas = async () => {
    try {
      setIsLoading(true);
      const data = await organigramaService.getRamas(selectedYear);
      setRamas(data);
    } catch (error) {
      console.error('Error al cargar ramas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRama = async (data: CreateRamaFormData) => {
    try {
      await organigramaService.createRama(data);
      await loadRamas(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear rama:', error);
      throw error;
    }
  };

  const handleViewRama = (rama: Rama) => {
    console.log('Ver detalles de rama:', rama);
    // TODO: Implementar modal de detalles
  };

  const handleEditRama = (rama: Rama) => {
    console.log('Editar rama:', rama);
    // TODO: Implementar modal de edición
  };

  const handleDeleteRama = async (rama: Rama) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la rama "${rama.nombre}"?`)) {
      try {
        await organigramaService.deleteRama(rama.id);
        await loadRamas(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar rama:', error);
      }
    }
  };

  const handleCreateSubrama = (ramaId: string) => {
    setSelectedRamaId(ramaId);
    setCreateSubramaModalOpen(true);
  };

  const handleSubmitSubrama = async (data: CreateSubramaFormData) => {
    try {
      await organigramaService.createSubrama(data);
      await loadRamas(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear subrama:', error);
      throw error;
    }
  };

  const handleViewSubrama = (subrama: any) => {
    console.log('Ver detalles de subrama:', subrama);
    // TODO: Implementar modal de detalles
  };

  const handleEditSubrama = (subrama: any) => {
    console.log('Editar subrama:', subrama);
    // TODO: Implementar modal de edición
  };

  const handleDeleteSubrama = async (subrama: any) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la subrama "${subrama.nombre}"?`)) {
      try {
        await organigramaService.deleteSubrama(subrama.id);
        await loadRamas(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar subrama:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Gestión de Organigrama
            </h1>
            <p className="text-muted-foreground">
              Administra la estructura de ramas y subramas de tu grupo scout
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Crear Nueva Rama
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select disabled>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
          </Select>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg shadow-sm bg-white p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Gestión de Organigrama
          </h1>
          <p className="text-muted-foreground">
            Administra la estructura de ramas y subramas de tu grupo scout
          </p>
        </div>
        <Button onClick={() => setCreateRamaModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Nueva Rama
        </Button>
      </div>

      {/* Controles de filtrado */}
      <div className="flex items-center space-x-4">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value: string) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de ramas */}
      <RamaList
        ramas={ramas}
        onViewRama={handleViewRama}
        onEditRama={handleEditRama}
        onDeleteRama={handleDeleteRama}
        onCreateSubrama={handleCreateSubrama}
        onViewSubrama={handleViewSubrama}
        onEditSubrama={handleEditSubrama}
        onDeleteSubrama={handleDeleteSubrama}
      />

      {/* Modales */}
      <CreateRamaModal
        open={createRamaModalOpen}
        onOpenChange={setCreateRamaModalOpen}
        onSubmit={handleCreateRama}
      />

      <CreateSubramaModal
        open={createSubramaModalOpen}
        onOpenChange={setCreateSubramaModalOpen}
        ramaId={selectedRamaId}
        onSubmit={handleSubmitSubrama}
      />
    </div>
  );
}
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
import EditRamaModal from './components/EditRamaModal';
import EditSubramaModal from './components/EditSubramaModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import SuccessModal from './components/SuccessModal';
import type { Rama, Subrama } from './types/rama.type';
import type {
  CreateRamaFormData,
  CreateSubramaFormData,
  UpdateRamaFormData,
  UpdateSubramaFormData,
} from './schemas/rama.schema';
import * as organigramaService from './services/organigrama.service';
import { availableYears } from './constants/mockData';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [editRamaModalOpen, setEditRamaModalOpen] = useState(false);
  const [editSubramaModalOpen, setEditSubramaModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'rama' | 'subrama';
    id: string;
    name: string;
  } | null>(null);
  const [selectedRamaId, setSelectedRamaId] = useState<string>('');
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] = useState<Subrama | null>(null);

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

  // ====== RAMAS ======
  const handleCreateRama = async (data: CreateRamaFormData) => {
    try {
      await organigramaService.createRama(data);
      await loadRamas();
      showSuccess('Rama creada con éxito');
    } catch (error) {
      console.error('Error al crear rama:', error);
      throw error;
    }
  };

  const handleEditRama = (rama: Rama) => {
    setRamaSeleccionada(rama);
    setEditRamaModalOpen(true);
  };

  const handleSubmitEditRama = async (data: UpdateRamaFormData) => {
    if (!ramaSeleccionada) return;
    try {
      await organigramaService.updateRama({ ...data, id: ramaSeleccionada.id });
      await loadRamas();
      showSuccess('Rama actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar rama:', error);
      throw error;
    }
  };

  const handleDeleteRama = (rama: Rama) => {
    setDeleteTarget({ type: 'rama', id: rama.id, name: rama.nombre });
    setConfirmDeleteOpen(true);
  };

  // ====== SUBRAMAS ======
  const handleCreateSubrama = (ramaId: string) => {
    setSelectedRamaId(ramaId);
    setCreateSubramaModalOpen(true);
  };

  const handleSubmitSubrama = async (data: CreateSubramaFormData) => {
    try {
      await organigramaService.createSubrama(data);
      await loadRamas();
      showSuccess('Subrama creada con éxito');
    } catch (error) {
      console.error('Error al crear subrama:', error);
      throw error;
    }
  };

  const handleEditSubrama = (subrama: Subrama) => {
    setSubramaSeleccionada(subrama);
    setEditSubramaModalOpen(true);
  };

  const handleSubmitEditSubrama = async (data: UpdateSubramaFormData) => {
    if (!subramaSeleccionada) return;
    try {
      await organigramaService.updateSubrama({ ...data, id: subramaSeleccionada.id });
      await loadRamas();
      showSuccess('Subrama actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar subrama:', error);
      throw error;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.nombre });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'rama') {
        await organigramaService.deleteRama(deleteTarget.id);
      } else {
        await organigramaService.deleteSubrama(deleteTarget.id);
      }
      await loadRamas();
      showSuccess(
        `${deleteTarget.type === 'rama' ? 'Rama' : 'Subrama'} eliminada con éxito`
      );
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  // ====== UTIL ======
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessOpen(true);
    setTimeout(() => setSuccessOpen(false), 2000);
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
          value={selectedYear ? String(selectedYear) : undefined}
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
        onEditRama={handleEditRama}
        onDeleteRama={handleDeleteRama}
        onCreateSubrama={handleCreateSubrama}
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

      <EditRamaModal
        open={editRamaModalOpen}
        onOpenChange={setEditRamaModalOpen}
        rama={ramaSeleccionada}
        onSubmit={handleSubmitEditRama}
      />

      <EditSubramaModal
        open={editSubramaModalOpen}
        onOpenChange={setEditSubramaModalOpen}
        subrama={subramaSeleccionada}
        onSubmit={handleSubmitEditSubrama}
      />

      {/* Confirmación y Éxito */}
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={`Confirmar Eliminación de ${
          deleteTarget?.type === 'rama' ? 'Rama' : 'Subrama'
        }`}
        message={`¿Estás seguro de que quieres eliminar ${
          deleteTarget?.type === 'rama' ? 'la rama' : 'la subrama'
        } "${deleteTarget?.name}"?`}
      />

      <SuccessModal
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}




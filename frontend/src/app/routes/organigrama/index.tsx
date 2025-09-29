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
import ErrorAlert from './components/ErrorAlert';
import OrganigramaLoader from './components/OrganigramaLoader';
import type { Rama, Subrama } from './types/rama.type';
import type {
  CreateRamaFormData,
  CreateSubramaFormData,
  UpdateRamaFormData,
  UpdateSubramaFormData,
} from './schemas/rama.schema';
import * as organigramaService from './services/organigrama.service';
import { useApiError } from './hooks/useApiError';
import { useTenantParams } from './hooks/useTenantParams';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
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
    sectionId?: string;
  } | null>(null);
  const [selectedRamaId, setSelectedRamaId] = useState<string>('');
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] = useState<Subrama | null>(null);
  
  // Hook para manejar errores de la API
  const { error, handleError, clearError } = useApiError();
  
  // Hook para obtener parámetros del tenant
  const { tenantSlug, groupSlug } = useTenantParams();

  // Cargar ramas al montar el componente y cuando cambie el año
  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    loadRamas();
  }, [selectedYear]);

  const loadAvailableYears = async () => {
    try {
      const years = await organigramaService.getAvailableYears(tenantSlug, groupSlug);
      setAvailableYears(years);
    } catch (error) {
      handleError(error);
      // Fallback en caso de error
      setAvailableYears([new Date().getFullYear()]);
    }
  };

  const loadRamas = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [Organigrama] Loading ramas with params:', { tenantSlug, groupSlug, selectedYear });
      const data = await organigramaService.getRamas(tenantSlug, groupSlug, selectedYear);
      console.log('🔍 [Organigrama] Loaded ramas:', data);
      setRamas(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== RAMAS ======
  const handleCreateRama = async (data: CreateRamaFormData) => {
    try {
      await organigramaService.createRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccess('Rama creada con éxito');
    } catch (error) {
      handleError(error);
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
      await organigramaService.updateRama(tenantSlug, groupSlug, { ...data, id: ramaSeleccionada.id });
      await loadRamas();
      showSuccess('Rama actualizada con éxito');
    } catch (error) {
      handleError(error);
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
      await organigramaService.createSubrama(tenantSlug, groupSlug, data.ramaId, data);
      await loadRamas();
      showSuccess('Subrama creada con éxito');
    } catch (error) {
      handleError(error);
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
  await organigramaService.updateSubrama(tenantSlug, groupSlug, { ...data, id: subramaSeleccionada.id, subgroup_id: String(subramaSeleccionada.subgroup_id), ramaId: subramaSeleccionada.ramaId });
      await loadRamas();
      showSuccess('Subrama actualizada con éxito');
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    // Guardar sectionId real para poder eliminar la subrama sin parsear el id
    const sectionId = subrama.section_id || subrama.ramaId || '';
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.nombre, sectionId });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'rama') {
        await organigramaService.deleteRama(tenantSlug, groupSlug, deleteTarget.id);
      } else {
        // Para subramas usamos el sectionId guardado en deleteTarget cuando esté disponible
        const sectionId = deleteTarget.sectionId;
        if (!sectionId) {
          // Fallback por compatibilidad: intentar derivarlo del id
          const fallbackSectionId = deleteTarget.id.split('-')[0];
          console.warn('⚠️ [Organigrama] sectionId no disponible en deleteTarget, usando fallback', { fallbackSectionId });
          await organigramaService.deleteSubrama(tenantSlug, groupSlug, fallbackSectionId, deleteTarget.id);
        } else {
          await organigramaService.deleteSubrama(tenantSlug, groupSlug, sectionId, deleteTarget.id);
        }
      }
      await loadRamas();
      showSuccess(
        `${deleteTarget.type === 'rama' ? 'Rama' : 'Subrama'} eliminada con éxito`
      );
    } catch (error) {
      handleError(error);
    }
  };

  // ====== UTIL ======
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessOpen(true);
    setTimeout(() => setSuccessOpen(false), 2000);
  };

  // Nota: render principal siempre mostrará la cabecera; la sección de lista
  // mostrará `OrganigramaLoader` mientras `isLoading` es true.

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

      {/* Mostrar errores de la API (si los hay) */}
      {error.hasError && (
        <ErrorAlert 
          message={error.message} 
          type={error.type} 
          onClose={clearError} 
        />
      )}

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
      {isLoading ? (
        <OrganigramaLoader />
      ) : (
        <RamaList
          ramas={ramas}
          onEditRama={handleEditRama}
          onDeleteRama={handleDeleteRama}
          onCreateSubrama={handleCreateSubrama}
          onEditSubrama={handleEditSubrama}
          onDeleteSubrama={handleDeleteSubrama}
        />
      )}

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




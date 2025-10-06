import { useState } from 'react';
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
import type { Rama, Subrama, CreateRamaData, UpdateSubramaData } from './types/rama.type';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from './schemas/rama.schema';
import { useTenantParams } from './hooks/useTenantParams';
import useOrganigramaData from './hooks/useOrganigramaData';
import useOrganigramaActions from './hooks/useOrganigramaActions';
import useOrganigramaExport from './hooks/useOrganigramaExport';
import { useApiError } from './hooks/useApiError';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Organigrama() {
  const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [editRamaModalOpen, setEditRamaModalOpen] = useState(false);
  const [editSubramaModalOpen, setEditSubramaModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // success ahora proviene del hook de acciones
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'rama' | 'subrama';
    id: string;
    name: string;
    sectionId?: string;
  } | null>(null);
  const [selectedRamaId, setSelectedRamaId] = useState<string>('');
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] = useState<Subrama | null>(null);
  
  const { tenantSlug, groupSlug } = useTenantParams();

  const {
    ramas,
    isLoading,
    availableYears,
    selectedYear,
    setSelectedYear,
    loadRamas,
  } = useOrganigramaData(tenantSlug, groupSlug);

  const { error, handleError, clearError } = useApiError();

  const { createRama, updateRama, createSubrama, updateSubrama, deleteRama, deleteSubrama, successOpen, successMessage, closeSuccess } =
    useOrganigramaActions({ tenantSlug, groupSlug, loadRamas, handleError });

  const { exportPDF, exportExcel } = useOrganigramaExport(ramas, selectedYear);
  


  // ====== RAMAS ======
  const handleCreateRama = async (data: CreateRamaData) => {
    return createRama(data);
  };

  const handleEditRama = (rama: Rama) => {
    setRamaSeleccionada(rama);
    setEditRamaModalOpen(true);
  };

  const handleSubmitEditRama = async (data: UpdateRamaFormData) => {
    if (!ramaSeleccionada) return;
    try {
      const payload = { ...data, id: ramaSeleccionada.id };
      await updateRama(payload as any);
    } catch (err) {
      handleError(err);
      throw err;
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
    return createSubrama(data);
  };

  const handleEditSubrama = (subrama: Subrama) => {
    setSubramaSeleccionada(subrama);
    setEditSubramaModalOpen(true);
  };

  const handleSubmitEditSubrama = async (data: UpdateSubramaFormData) => {
    if (!subramaSeleccionada) return;
    try {
      const updateData: UpdateSubramaData = {
        id: subramaSeleccionada.id,
        subgroup_id: subramaSeleccionada.subgroup_id,
        ramaId: subramaSeleccionada.ramaId,
        ...data,
      };
      await updateSubrama(updateData as any);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    const sectionId = subrama.section_id ?? subrama.ramaId ?? undefined;
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.nombre, sectionId });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (!tenantSlug || !groupSlug) {
        handleError(new Error('Tenant o group no disponibles para eliminar.'));
        setConfirmDeleteOpen(false);
        return;
      }
      if (deleteTarget.type === 'rama') {
        await deleteRama(deleteTarget.id);
      } else {
        const sectionId = deleteTarget.sectionId;
        if (!sectionId) {
          if (!deleteTarget.id || !deleteTarget.id.includes('-')) {
            handleError(new Error('No se puede determinar sectionId para eliminar la subrama.'));
            setConfirmDeleteOpen(false);
            return;
          }
          const fallbackSectionId = deleteTarget.id.split('-')[0];
          console.warn('⚠️ [Organigrama] sectionId no disponible en deleteTarget, usando fallback', { fallbackSectionId });
          await deleteSubrama(fallbackSectionId, deleteTarget.id);
        } else {
          await deleteSubrama(sectionId, deleteTarget.id);
        }
      }
      handleError(null); 
    } catch (err) {
      // @ts-ignore
      handleError(err);
    }
  };

  // ====== EXPORTAR ORGANIGRAMA ======
  const handleExportPDF = () => exportPDF();
  const handleExportExcel = () => exportExcel();

  // ====== UTIL ======

  // no local success timeout: gestionado por useOrganigramaActions


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
        <div className="flex items-center gap-2">
          {/* ⬇️ Nuevo: Exportar organigrama */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Exportar organigrama
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportPDF}>
                Exportar en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Exportar en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setCreateRamaModalOpen(true)}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Nueva Rama
          </Button>
        </div>
      </div>

      {/* Mostrar errores de la API  */}
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
          value={selectedYear}
          onValueChange={(value: string) => setSelectedYear(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.filter(year => year !== undefined && year !== null).map((year) => (
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
        onSuccess={loadRamas}
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
        onSuccess={loadRamas}
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
    onConfirm={onConfirmDelete}
        onSuccess={loadRamas}
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
        onClose={closeSuccess}
      />
    </div>
  );
}




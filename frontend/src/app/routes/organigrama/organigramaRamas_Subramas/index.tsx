import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Plus icon no usado porque el botón de crear rama se removió
// import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Select de año eliminado temporalmente por requerimiento del stakeholder.
// Si se requiere restaurarlo más adelante, descomentar la importación y el bloque JSX correspondiente.
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import RamaList from './components/RamaList';
// CreateRamaModal importada pero no usada porque la creación de ramas fue deshabilitada
// import CreateRamaModal from './components/CreateRamaModal';
import CreateSubramaModal from './components/CreateSubramaModal';
import EditRamaModal from './components/EditRamaModal';
import EditSubramaModal from './components/EditSubramaModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import SuccessModal from './components/SuccessModal';
import ErrorAlert from './components/ErrorAlert';
import OrganigramaLoader from './components/OrganigramaLoader';
import type {
  Branch as Rama,
  Subgroup as Subrama,
  // CreateBranchData as CreateRamaData, (no usado - creación de ramas deshabilitada)
  CreateSubgroupData,
  UpdateBranchData,
  UpdateSubgroupData,
} from './types/frontend';
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
  // Creación de rama deshabilitada: ramas fijas según requerimiento del stakeholder.
  // const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [editRamaModalOpen, setEditRamaModalOpen] = useState(false);
  const [editSubramaModalOpen, setEditSubramaModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'rama' | 'subrama';
    id: string;
    name: string;
    sectionId?: string;
  } | null>(null);

  const [selectedRamaId, setSelectedRamaId] = useState<string>('');
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] = useState<Subrama | null>(null);

  const navigate = useNavigate();

  const { tenantSlug, groupSlug } = useTenantParams();

  const {
    ramas,
    isLoading,
    selectedYear,
    loadRamas,
  } = useOrganigramaData(tenantSlug, groupSlug);

  const { error, handleError, clearError } = useApiError();

  const {
    // createRama, (creación de ramas deshabilitada)
    updateRama,
    createSubrama,
    updateSubrama,
    deleteRama,
    deleteSubrama,
    successOpen,
    successMessage,
    closeSuccess,
  } = useOrganigramaActions({ tenantSlug, groupSlug, loadRamas, handleError });

  const { exportPDF, exportExcel } = useOrganigramaExport(ramas, selectedYear);

  // ====== RAMAS ======
  // Funcionalidad de creación de rama deshabilitada (ramas fijas).
  // const handleCreateRama = async (data: CreateRamaData) => {
  //   return createRama(data);
  // };

  const handleEditRama = (rama: Rama) => {
    setRamaSeleccionada(rama);
    setEditRamaModalOpen(true);
  };

  const handleSubmitEditRama = async (data: UpdateBranchData) => {
    try {
      const payload: UpdateBranchData = { ...data };
      if (!payload.id && ramaSeleccionada) payload.id = ramaSeleccionada.id;
      await updateRama(payload);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  // Función de eliminación de rama deshabilitada temporalmente porque el botón de
  // eliminar rama fue inhabilitado en la UI. Se mantiene aquí comentada para
  // facilitar su restauración si se decide re-habilitar la funcionalidad.
  // const handleDeleteRama = (rama: Rama) => {
  //   setDeleteTarget({ type: 'rama', id: rama.id, name: rama.name ?? rama.nombre ?? '' });
  //   setConfirmDeleteOpen(true);
  // };

  // ====== SUBRAMAS ======
  const handleCreateSubrama = (ramaId: string) => {
    setSelectedRamaId(ramaId);
    setCreateSubramaModalOpen(true);
  };

  const handleSubmitSubrama = async (data: CreateSubgroupData) => {
    return createSubrama(data);
  };

  const handleEditSubrama = (subrama: Subrama) => {
    setSubramaSeleccionada(subrama);
    setEditSubramaModalOpen(true);
  };

  const handleSubmitEditSubrama = async (data: UpdateSubgroupData) => {
    try {
      const payload: UpdateSubgroupData = { ...data };
      if (!payload.id && subramaSeleccionada) payload.id = subramaSeleccionada.id;
      await updateSubrama(payload);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    const sectionId = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? undefined;
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.name ?? subrama.nombre ?? '', sectionId });
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
      handleError(err as unknown);
    }
    setConfirmDeleteOpen(false);
  };

  // ====== EXPORTAR ORGANIGRAMA ======
  const handleExportPDF = () => exportPDF();
  const handleExportExcel = () => exportExcel();

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestión de Organigrama</h1>
          <p className="text-muted-foreground">Administra la estructura de ramas y subramas de tu grupo scout</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Exportar organigrama</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportPDF}>Exportar en PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>Exportar en Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón de crear nueva rama removido: ramas fijas según stakeholder. */}
        </div>
      </div>

      {/* Mostrar errores de la API  */}
      {error.hasError && <ErrorAlert message={error.message} type={error.type} onClose={clearError} />}

      {/* Controles de filtrado */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/app/organigrama')} className="text-sm">Anterior</Button>
        {/* Select de año eliminado temporalmente por el stakeholder. Si se necesita restaurarlo,
            descomentar el bloque JSX y la import correspondiente en la cabecera del archivo. */}
        {/*
        <Select value={selectedYear} onValueChange={(value: string) => setSelectedYear(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.filter((year) => year !== undefined && year !== null).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        */}
      </div>

      {/* Lista de ramas */}
      {isLoading ? (
        <OrganigramaLoader />
      ) : (
        <RamaList
          ramas={ramas}
          onEditRama={handleEditRama}
          onCreateSubrama={handleCreateSubrama}
          onEditSubrama={handleEditSubrama}
          onDeleteSubrama={handleDeleteSubrama}
        />
      )}

      {/* Modales */}
  {/* CreateRamaModal deshabilitado porque la creación de ramas fue removida */}
  {/* <CreateRamaModal open={createRamaModalOpen} onOpenChange={setCreateRamaModalOpen} onSubmit={handleCreateRama} onSuccess={loadRamas} /> */}

      <CreateSubramaModal open={createSubramaModalOpen} onOpenChange={setCreateSubramaModalOpen} ramaId={selectedRamaId} onSubmit={handleSubmitSubrama} />

      <EditRamaModal open={editRamaModalOpen} onOpenChange={setEditRamaModalOpen} rama={ramaSeleccionada} onSubmit={handleSubmitEditRama} onSuccess={loadRamas} />

      <EditSubramaModal open={editSubramaModalOpen} onOpenChange={setEditSubramaModalOpen} subrama={subramaSeleccionada} onSubmit={handleSubmitEditSubrama} />

      {/* Confirmación y Éxito */}
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        onSuccess={loadRamas}
        title={`Confirmar Eliminación de ${deleteTarget?.type === 'rama' ? 'Rama' : 'Subrama'}`}
        message={`¿Estás seguro de que quieres eliminar ${deleteTarget?.type === 'rama' ? 'la rama' : 'la subrama'} "${deleteTarget?.name}"?`}
      />

      <SuccessModal open={successOpen} message={successMessage} onClose={closeSuccess} />
    </div>
  );
}

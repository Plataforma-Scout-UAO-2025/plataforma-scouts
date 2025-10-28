import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RamaList from './components/RamaList';
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
  CreateSubgroupData,
  UpdateBranchData,
  UpdateSubgroupData,
} from './types/frontend';
import { useTenantParams } from './hooks/useTenantParams';
import useOrganigramaDataWithCache from './hooks/useOrganigramaDataWithCache';
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
  const { tenantId, groupSlug, isLoading: tenantLoading, isFetching, hasMissingParams, error: tenantError } = useTenantParams();

  const {
    ramas,
    loadRamas,
    isLoading: dataLoading,
  } = useOrganigramaDataWithCache(tenantId, groupSlug);

  const { error, handleError, clearError } = useApiError();

  useEffect(() => {
    if (tenantError) {
      handleError(new Error(tenantError));
    }
  }, [tenantError, handleError]);

  const {
    updateRama,
    createSubrama,
    updateSubrama,
    deleteRama,
    deleteSubrama,
    successOpen,
    successMessage,
    closeSuccess,
  } = useOrganigramaActions({ tenantId, groupSlug, loadRamas, handleError });

  const { exportPDF, exportExcel } = useOrganigramaExport(ramas, { tenantId, groupSlug });

  // ====== RAMAS ======
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
      if (!tenantId || !groupSlug) {
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestión de Ramas y Subramas Scouts</h1>
          <p className="text-muted-foreground">Administra la estructura de ramas y subramas de tu grupo scout</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Exportar Datos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportPDF}>Exportar en PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>Exportar en CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mostrar errores de la API  */}
      {error.hasError && <ErrorAlert message={error.message} type={error.type} onClose={clearError} />}

      {/* Controles de filtrado */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/app/organigrama')} className="text-sm">Anterior</Button>
      </div>

      {/* Lista de ramas */}
      {/* Mostrar loader si el tenant/group o los datos están cargando y aún no hay ramas */}
      {( (isFetching || tenantLoading || dataLoading) && (!ramas || ramas.length === 0) ) ? (
        <OrganigramaLoader />
      ) : hasMissingParams && !isFetching && (!ramas || ramas.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No se pudo determinar el tenant o el grupo. Comprueba tu sesión o contacta al administrador.</p>
        </div>
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
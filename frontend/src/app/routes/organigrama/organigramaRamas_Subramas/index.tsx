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
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
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
import type {
  CreateSubramaFormData,
  UpdateRamaFormData,
  UpdateSubramaFormData,
} from './schemas/rama.schema';
import * as organigramaService from './services';
import { useApiError } from './hooks/useApiError';
import { useTenantParams } from './hooks/useTenantParams';

// ⬇️ Nuevo: menú y funciones de exportación
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  exportarOrganigramaPDF,
  exportarOrganigramaCSV,
} from './utils/exportarOrganigrama';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsLoadingYears] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [editRamaModalOpen, setEditRamaModalOpen] = useState(false);
  const [editSubramaModalOpen, setEditSubramaModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'rama' | 'subrama';
    id: string;
    name: string;
    sectionId?: string;
  } | null>(null);
  const [selectedRamaId, setSelectedRamaId] = useState<string>('');
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] = useState<Subrama | null>(null);
  const successTimeoutRef = useRef<number | null>(null);
  
  // Control de carga para evitar llamadas duplicadas
  const isLoadingRamasRef = useRef(false);
  const isLoadingYearsRef = useRef(false);
  
  const { error, handleError, clearError } = useApiError();
  const { tenantSlug, groupSlug } = useTenantParams();

  const loadAvailableYears = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingYearsRef.current) return;
    try {
      isLoadingYearsRef.current = true;
      setIsLoadingYears(true);
      console.log('🔄 [Organigrama] Cargando años disponibles...');
      
      const years = await organigramaService.getAvailableYears(tenantSlug, groupSlug);
      setAvailableYears(years);
      
      // Establecer automáticamente el primer año si no hay uno seleccionado
      if (!selectedYear && years.length > 0) {
        setSelectedYear(years[0].toString());
      }
      
      console.log('✅ [Organigrama] Años cargados exitosamente:', years.length);
    } catch (error) {
      console.error('❌ [Organigrama] Error cargando años:', error);
      handleError(error);
      setAvailableYears([new Date().getFullYear()]);
    } finally {
      setIsLoadingYears(false);
      isLoadingYearsRef.current = false;
    }
  }, [tenantSlug, groupSlug, handleError]);

  const loadRamas = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingRamasRef.current) return;
    try {
      isLoadingRamasRef.current = true;
      setIsLoading(true);
      console.log('🔄 [Organigrama] Cargando ramas...', { selectedYear });
      
      // Convertir selectedYear a number si no está vacío, sino undefined
      const yearFilter = selectedYear ? parseInt(selectedYear) : undefined;
      const data = await organigramaService.getRamas(tenantSlug, groupSlug, yearFilter);
      setRamas(data);
      
      console.log('✅ [Organigrama] Ramas cargadas exitosamente:', data.length);
    } catch (error) {
      console.error('❌ [Organigrama] Error cargando ramas:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
      isLoadingRamasRef.current = false;
    }
  }, [tenantSlug, groupSlug, selectedYear, handleError]);

  useEffect(() => {
    if (tenantSlug && groupSlug) {
      console.log('🚀 [Organigrama] Inicializando carga de años...');
      loadAvailableYears();
    }
  }, [tenantSlug, groupSlug]);

  useEffect(() => {
    if (tenantSlug && groupSlug) {
      console.log('🚀 [Organigrama] Inicializando carga de ramas...');
      loadRamas();
    }
  }, [tenantSlug, groupSlug, selectedYear]);

  // ====== RAMAS ======
  const handleCreateRama = async (data: CreateRamaData) => {
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
      const updateData: UpdateSubramaData = {
        id: subramaSeleccionada.id,
        subgroup_id: subramaSeleccionada.subgroup_id,
        ramaId: subramaSeleccionada.ramaId,
        ...data,
      };
      await organigramaService.updateSubrama(tenantSlug, groupSlug, updateData);
      await loadRamas();
      showSuccess('Subrama actualizada con éxito');
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    const sectionId = subrama.section_id ?? subrama.ramaId ?? undefined;
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.nombre, sectionId });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (!tenantSlug || !groupSlug) {
        handleError(new Error('Tenant o group no disponibles para eliminar.'));
        setConfirmDeleteOpen(false);
        return;
      }
      if (deleteTarget.type === 'rama') {
        await organigramaService.deleteRama(tenantSlug, groupSlug, deleteTarget.id);
      } else {
        const sectionId = deleteTarget.sectionId;
        if (!sectionId) {
          if (!deleteTarget.id || !deleteTarget.id.includes('-')) {
            handleError(new Error('No se puede determinar sectionId para eliminar la subrama.'));
            setConfirmDeleteOpen(false);
            return;
          }
          const fallbackSectionId = deleteTarget.id.split('-')[0];
          console.warn('⚠️ [Organigrama] sectionId no disponible, usando fallback', { fallbackSectionId });
          await organigramaService.deleteSubrama(tenantSlug, groupSlug, fallbackSectionId, deleteTarget.id);
        } else {
          await organigramaService.deleteSubrama(tenantSlug, groupSlug, sectionId, deleteTarget.id);
        }
      }
      await loadRamas();
      showSuccess(`${deleteTarget.type === 'rama' ? 'Rama' : 'Subrama'} eliminada con éxito`);
    } catch (error) {
      handleError(error);
    }
  };

  // ====== EXPORTAR ORGANIGRAMA ======
  const handleExportPDF = () => {
    const anio = selectedYear ? parseInt(selectedYear) : undefined;
    exportarOrganigramaPDF(ramas, { anio, colorHex: '#1A4134' });
  };

  const handleExportCSV = () => {
    exportarOrganigramaCSV(ramas);
  };

  // ====== UTIL ======
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessOpen(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = window.setTimeout(() => {
      setSuccessOpen(false);
      successTimeoutRef.current = null;
    }, 2000);
  };

  const closeSuccess = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setSuccessOpen(false);
  };

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, []);

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
          {/* ⬇️ Exportar organigrama */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Exportar organigrama</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportPDF}>
                Exportar en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                Exportar en CSV
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

      {/* Mostrar errores de la API */}
      {error.hasError && (
        <ErrorAlert message={error.message} type={error.type} onClose={clearError} />
      )}

      {/* Controles de filtrado */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/app/organigrama")} className="text-sm">Anterior</Button>
        <Select value={selectedYear} onValueChange={(value: string) => setSelectedYear(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {availableYears
              .filter(year => year !== undefined && year !== null)
              .map(year => (
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
        onConfirm={confirmDelete}
        onSuccess={loadRamas}
        title={`Confirmar Eliminación de ${deleteTarget?.type === 'rama' ? 'Rama' : 'Subrama'}`}
        message={`¿Estás seguro de que quieres eliminar ${
          deleteTarget?.type === 'rama' ? 'la rama' : 'la subrama'
        } "${deleteTarget?.name}"?`}
      />
      <SuccessModal open={successOpen} message={successMessage} onClose={closeSuccess} />
    </div>
  );
}

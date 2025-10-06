<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
=======
import { useState, useEffect, useRef, useCallback } from 'react';
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
<<<<<<< HEAD
import type { Rama, Subrama, CreateRamaData } from './types/rama.type';
=======
import type { Rama, Subrama, CreateRamaData, UpdateSubramaData } from './types/rama.type';
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
import type {
  CreateSubramaFormData,
  UpdateRamaFormData,
  UpdateSubramaFormData,
} from './schemas/rama.schema';
<<<<<<< HEAD
import * as organigramaService from './services/organigrama.service';
import { useApiError } from './hooks/useApiError';
import { useTenantParams } from './hooks/useTenantParams';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
=======
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
  exportarOrganigramaExcel,
} from './utils/exportarOrganigrama';

export default function Organigrama() {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsLoadingYears] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
  const successTimeoutRef = useRef<number | null>(null);
  
<<<<<<< HEAD
=======
  // Control de carga para evitar llamadas duplicadas
  const isLoadingRamasRef = useRef(false);
  const isLoadingYearsRef = useRef(false);
  
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  const { error, handleError, clearError } = useApiError();
  
  const { tenantSlug, groupSlug } = useTenantParams();

<<<<<<< HEAD
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
      setAvailableYears([new Date().getFullYear()]);
    }
  };

  const loadRamas = async () => {
    try {
      setIsLoading(true);
      const data = await organigramaService.getRamas(tenantSlug, groupSlug, selectedYear);
      setRamas(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
=======
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

  // Cargar años disponibles solo una vez al montar el componente
  useEffect(() => {
    if (tenantSlug && groupSlug) {
      console.log('🚀 [Organigrama] Inicializando carga de años...');
      loadAvailableYears();
    }
  }, [tenantSlug, groupSlug]); // Removido loadAvailableYears de las dependencias para evitar re-ejecutar

  // Cargar ramas cuando cambien los parámetros de filtrado
  useEffect(() => {
    if (tenantSlug && groupSlug) {
      console.log('🚀 [Organigrama] Inicializando carga de ramas...');
      loadRamas();
    }
  }, [tenantSlug, groupSlug, selectedYear]); // Removido loadRamas de las dependencias para evitar re-ejecutar
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f

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
<<<<<<< HEAD
  await organigramaService.updateSubrama(tenantSlug, groupSlug, { ...data, id: subramaSeleccionada.id, subgroup_id: String(subramaSeleccionada.subgroup_id), ramaId: subramaSeleccionada.ramaId });
=======
      // Crear el objeto UpdateSubramaData con la estructura correcta
      const updateData: UpdateSubramaData = {
        id: subramaSeleccionada.id,
        subgroup_id: subramaSeleccionada.subgroup_id,
        ramaId: subramaSeleccionada.ramaId,
        ...data // Los datos del formulario
      };
      
      await organigramaService.updateSubrama(tenantSlug, groupSlug, updateData);
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
      await loadRamas();
      showSuccess('Subrama actualizada con éxito');
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
<<<<<<< HEAD
    const sectionId = subrama.section_id || subrama.ramaId || '';
=======
    // Preferir section_id (snake_case) devuelto por la API, si no usar ramaId.
    // Si ninguno existe, dejar undefined (no usar cadena vacía) para detectar falta explícita.
    const sectionId = subrama.section_id ?? subrama.ramaId ?? undefined;
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    setDeleteTarget({ type: 'subrama', id: subrama.id, name: subrama.nombre, sectionId });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
<<<<<<< HEAD
=======
      // Proteger contra llamadas sin tenant/group
      if (!tenantSlug || !groupSlug) {
        handleError(new Error('Tenant o group no disponibles para eliminar.'));
        setConfirmDeleteOpen(false);
        return;
      }
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
      if (deleteTarget.type === 'rama') {
        await organigramaService.deleteRama(tenantSlug, groupSlug, deleteTarget.id);
      } else {
        const sectionId = deleteTarget.sectionId;
        if (!sectionId) {
<<<<<<< HEAD
=======
          // Solo usar el fallback si el id tiene el formato esperado (contiene '-')
          if (!deleteTarget.id || !deleteTarget.id.includes('-')) {
            handleError(new Error('No se puede determinar sectionId para eliminar la subrama.')); 
            setConfirmDeleteOpen(false);
            return;
          }
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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

<<<<<<< HEAD
=======
  // ====== EXPORTAR ORGANIGRAMA ======
  const handleExportPDF = () => {
    const anio = selectedYear ? parseInt(selectedYear) : undefined;
    exportarOrganigramaPDF(ramas, { anio, colorHex: '#1A4134' });
  };

  const handleExportExcel = () => {
    exportarOrganigramaExcel(ramas);
  };

>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
  // ====== UTIL ======
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessOpen(true);
    // Limpiar cualquier timeout previo antes de crear uno nuevo
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = window.setTimeout(() => {
      setSuccessOpen(false);
      successTimeoutRef.current = null;
    }, 2000);
  };

  // Handler para cerrar el modal de éxito y limpiar timeout asociado
  const closeSuccess = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setSuccessOpen(false);
  };

  // Cleanup: limpiar timeout si el componente se desmonta
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
<<<<<<< HEAD
        <Button
          onClick={() => setCreateRamaModalOpen(true)}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Nueva Rama
        </Button>
=======
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
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
<<<<<<< HEAD
          value={selectedYear ? String(selectedYear) : undefined}
          onValueChange={(value: string) => setSelectedYear(parseInt(value))}
=======
          value={selectedYear}
          onValueChange={(value: string) => setSelectedYear(value)}
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
<<<<<<< HEAD
=======
        onSuccess={loadRamas}
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
<<<<<<< HEAD
=======
        onSuccess={loadRamas}
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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
<<<<<<< HEAD
=======
        onSuccess={loadRamas}
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
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




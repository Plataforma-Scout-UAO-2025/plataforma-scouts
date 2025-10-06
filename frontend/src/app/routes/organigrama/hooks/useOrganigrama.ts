import { useCallback, useEffect, useRef, useState } from 'react';
import type { Rama, CreateRamaData } from '../types/rama.type';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from '../schemas/rama.schema';
import * as organigramaService from '../services';
import { useApiError } from '../hooks/useApiError';
import { exportarOrganigramaPDF, exportarOrganigramaExcel } from '../utils/exportarOrganigrama';

type UseOrganigramaReturn = {
  ramas: Rama[];
  isLoading: boolean;
  availableYears: number[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  loadRamas: () => Promise<void>;
  handleCreateRama: (data: CreateRamaData) => Promise<void>;
  handleSubmitEditRama: (data: UpdateRamaFormData) => Promise<void>;
  handleSubmitSubrama: (data: CreateSubramaFormData) => Promise<void>;
  handleSubmitEditSubrama: (data: UpdateSubramaFormData) => Promise<void>;
  confirmDelete: () => Promise<void>;
  handleExportPDF: () => void;
  handleExportExcel: () => void;
  error: ReturnType<typeof useApiError>['error'];
  clearError: () => void;
  successOpen: boolean;
  successMessage: string;
  closeSuccess: () => void;
  handleError: (err: any) => void;
};

/**
  Hook responsable de la carga y acciones del organigrama (fetch, create, update, delete, export)
 */
export function useOrganigrama(tenantSlug?: string, groupSlug?: string): UseOrganigramaReturn {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const successTimeoutRef = useRef<number | null>(null);
  const isLoadingRamasRef = useRef(false);
  const isLoadingYearsRef = useRef(false);

  const { error, handleError, clearError } = useApiError();

  const loadAvailableYears = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingYearsRef.current) return;
    try {
      isLoadingYearsRef.current = true;
      const years = await organigramaService.getAvailableYears(tenantSlug, groupSlug);
      setAvailableYears(years);
      if (!selectedYear && years.length > 0) setSelectedYear(years[0].toString());
    } catch (err) {
      handleError(err);
      setAvailableYears([new Date().getFullYear()]);
    } finally {
      isLoadingYearsRef.current = false;
    }
  }, [tenantSlug, groupSlug, handleError, selectedYear]);

  const loadRamas = useCallback(async () => {
    if (!tenantSlug || !groupSlug || isLoadingRamasRef.current) return;
    try {
      isLoadingRamasRef.current = true;
      setIsLoading(true);
      const yearFilter = selectedYear ? parseInt(selectedYear) : undefined;
      const data = await organigramaService.getRamas(tenantSlug, groupSlug, yearFilter);
      setRamas(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      isLoadingRamasRef.current = false;
    }
  }, [tenantSlug, groupSlug, selectedYear, handleError]);

  useEffect(() => {
    if (tenantSlug && groupSlug) loadAvailableYears();
  }, [tenantSlug, groupSlug, loadAvailableYears]);

  useEffect(() => {
    if (tenantSlug && groupSlug) loadRamas();
  }, [tenantSlug, groupSlug, selectedYear, loadRamas]);

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

  const handleCreateRama = useCallback(async (data: CreateRamaData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      await organigramaService.createRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccess('Rama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError]);

  const handleSubmitEditRama = useCallback(async (data: UpdateRamaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      // @ts-ignore
      await organigramaService.updateRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccess('Rama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError]);

  const handleSubmitSubrama = useCallback(async (data: CreateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      await organigramaService.createSubrama(tenantSlug, groupSlug, data.ramaId, data);
      await loadRamas();
      showSuccess('Subrama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError]);

  const handleSubmitEditSubrama = useCallback(async (data: UpdateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      // @ts-ignore
      await organigramaService.updateSubrama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccess('Subrama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError]);

  const confirmDelete = useCallback(async () => {
    throw new Error('confirmDelete debe ser delegado desde el componente que conoce el deleteTarget.');
  }, []);

  const handleExportPDF = useCallback(() => {
    const anio = selectedYear ? parseInt(selectedYear) : undefined;
    exportarOrganigramaPDF(ramas, { anio, colorHex: '#1A4134' });
  }, [ramas, selectedYear]);

  const handleExportExcel = useCallback(() => {
    exportarOrganigramaExcel(ramas);
  }, [ramas]);

  return {
    ramas,
    isLoading,
    availableYears,
    selectedYear,
    setSelectedYear,
    loadRamas,
    handleCreateRama,
    handleSubmitEditRama,
    handleSubmitSubrama,
    handleSubmitEditSubrama,
    confirmDelete,
    handleExportPDF,
    handleExportExcel,
    error,
    clearError,
    successOpen,
    successMessage,
    closeSuccess,
    handleError,
  };
}

export default useOrganigrama;

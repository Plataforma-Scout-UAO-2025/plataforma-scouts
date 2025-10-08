import { useCallback, useRef, useState, useEffect } from 'react';
import * as organigramaService from '../services';
import type { CreateBranchData, UpdateBranchData, CreateSubgroupData, UpdateSubgroupData } from '../types/frontend';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from '@/models/models/rama.schema';

type ActionsParams = {
  tenantSlug?: string;
  groupSlug?: string;
  loadRamas: () => Promise<void>;
  showSuccess?: (msg: string) => void;
  handleError: (err: unknown) => void;
};

export function useOrganigramaActions({ tenantSlug, groupSlug, loadRamas, showSuccess, handleError }: ActionsParams) {
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, []);

  const showSuccessLocal = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setSuccessOpen(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = window.setTimeout(() => {
      setSuccessOpen(false);
      successTimeoutRef.current = null;
    }, 2000);
    // también invocar callback externo si fue proveído (compatibilidad)
    try {
      if (showSuccess) showSuccess(msg);
    } catch {
      // noop
    }
  }, [showSuccess]);

  const closeSuccess = useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setSuccessOpen(false);
  }, []);

  const createRama = useCallback(async (data: CreateBranchData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
        // Pasar el payload frontend al servicio; el servicio espera CreateBranchData
        await organigramaService.createRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccessLocal('Rama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const updateRama = useCallback(async (data: UpdateBranchData | UpdateRamaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
  const frontendData: UpdateBranchData = (data as UpdateBranchData);
        // Pasar frontend payload (servicio mapea a backend)
        await organigramaService.updateRama(tenantSlug, groupSlug, frontendData);
      await loadRamas();
      showSuccessLocal('Rama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const createSubrama = useCallback(async (data: CreateSubgroupData | CreateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      const frontendData = data as CreateSubgroupData;
        // El servicio espera (sectionId, CreateSubramaData) y mapeará internamente
        await organigramaService.createSubrama(tenantSlug, groupSlug, frontendData.branchId, frontendData);
      await loadRamas();
      showSuccessLocal('Subrama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const updateSubrama = useCallback(async (data: UpdateSubgroupData | UpdateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      const frontendData = data as UpdateSubgroupData;
        // Asegurar que el servicio recibe ramaId (ramaId esperado en UpdateSubramaData)
        const servicePayload: UpdateSubgroupData = { ...frontendData };
        if (!servicePayload.branchId) {
          // intentar obtener ramaId/section_id si fue pasado en forma legacy
          const fd = frontendData as unknown as Record<string, unknown>;
          const maybeRamaId = (fd['ramaId'] ?? fd['section_id'] ?? fd['branchId']) as string | number | undefined;
          if (maybeRamaId) servicePayload.branchId = String(maybeRamaId);
        }
        await organigramaService.updateSubrama(tenantSlug, groupSlug, servicePayload);
      await loadRamas();
      showSuccessLocal('Subrama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const deleteRama = useCallback(async (id: string) => {
    if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
    try {
      await organigramaService.deleteRama(tenantSlug, groupSlug, id);
      await loadRamas();
      showSuccessLocal('Rama eliminada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const deleteSubrama = useCallback(async (sectionId: string, id: string) => {
    if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
    try {
      await organigramaService.deleteSubrama(tenantSlug, groupSlug, sectionId, id);
      await loadRamas();
      showSuccessLocal('Subrama eliminada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, handleError, showSuccessLocal]);

  // =====================================================
  // Acciones de galería para Secciones (Ramas)
  // =====================================================
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const addGalleryImage = useCallback(async (sectionId: string, file: File) => {
    if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
      await organigramaService.addGalleryImage(tenantSlug, groupSlug, sectionId, file);
      await loadRamas();
      showSuccessLocal('Imagen agregada a la galería');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccessLocal, handleError]);

  const replaceGalleryImage = useCallback(async (sectionId: string, targetUuid: string, newFile: File) => {
    if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
      await organigramaService.replaceGalleryImage(tenantSlug, groupSlug, sectionId, targetUuid, newFile);
      await loadRamas();
      showSuccessLocal('Imagen de galería reemplazada');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccessLocal, handleError]);

  const removeGalleryImage = useCallback(async (sectionId: string, targetUuidOrUrl: string, deleteFromStorage = false) => {
    if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
      // deleteGalleryImageById acepta UUID o URL (extrae UUID internamente)
      await organigramaService.deleteGalleryImageById(tenantSlug, groupSlug, sectionId, targetUuidOrUrl, deleteFromStorage);
      await loadRamas();
      showSuccessLocal('Imagen eliminada de la galería');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccessLocal, handleError]);

  return {
    createRama,
    updateRama,
    createSubrama,
    updateSubrama,
    deleteRama,
    deleteSubrama,
    successOpen,
    successMessage,
    closeSuccess,
    // gallery actions
    addGalleryImage,
    replaceGalleryImage,
    removeGalleryImage,
    isLoadingGallery,
  };
}

export default useOrganigramaActions;

import { useCallback, useRef, useState, useEffect } from 'react';
import * as organigramaService from '../services';
import type { CreateBranchData, UpdateBranchData, CreateSubgroupData, UpdateSubgroupData } from '../types/frontend';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from '@/schemas/rama.schema';

type ActionsParams = {
  tenantId?: string;
  groupSlug?: string;
  loadRamas: (opts?: { force?: boolean }) => Promise<void>;
  showSuccess?: (msg: string) => void;
  handleError: (err: unknown) => void;
};

export function useOrganigramaActions({ tenantId, groupSlug, loadRamas, showSuccess, handleError }: ActionsParams) {
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
    try {
      if (showSuccess) showSuccess(msg);
    } catch (e) {
      // Si la función externa falla, registramos para diagnóstico pero no rompemos la UI
      // Esto evita el bloque vacío que ESLint marca como error
      // eslint-disable-next-line no-console
      console.warn('[useOrganigramaActions] showSuccess hook threw:', e);
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
      if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    await organigramaService.createRama(tenantId, groupSlug, data);
    await loadRamas({ force: true });
      showSuccessLocal('Rama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const updateRama = useCallback(async (data: UpdateBranchData | UpdateRamaFormData) => {
    try {
      if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
  const frontendData: UpdateBranchData = (data as UpdateBranchData);
        await organigramaService.updateRama(tenantId, groupSlug, frontendData);
      await loadRamas({ force: true });
      showSuccessLocal('Rama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const createSubrama = useCallback(async (data: CreateSubgroupData | CreateSubramaFormData) => {
    try {
      if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
      const frontendData = data as CreateSubgroupData;
        await organigramaService.createSubrama(tenantId, groupSlug, frontendData.branchId, frontendData);
      await loadRamas({ force: true });
      showSuccessLocal('Subrama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const updateSubrama = useCallback(async (data: UpdateSubgroupData | UpdateSubramaFormData) => {
    try {
  if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
      const frontendData = data as UpdateSubgroupData;
        const servicePayload: UpdateSubgroupData = { ...frontendData };
        if (!servicePayload.branchId) {
          const fd = frontendData as unknown as Record<string, unknown>;
          const maybeRamaId = (fd['ramaId'] ?? fd['section_id'] ?? fd['branchId']) as string | number | undefined;
          if (maybeRamaId) servicePayload.branchId = String(maybeRamaId);
        }
        await organigramaService.updateSubrama(tenantId, groupSlug, servicePayload);
      await loadRamas({ force: true });
      showSuccessLocal('Subrama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const deleteRama = useCallback(async (id: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    try {
  await organigramaService.deleteRama(tenantId, groupSlug, id);
  await loadRamas({ force: true });
      showSuccessLocal('Rama eliminada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  const deleteSubrama = useCallback(async (sectionId: string, id: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    try {
  await organigramaService.deleteSubrama(tenantId, groupSlug, sectionId, id);
  await loadRamas({ force: true });
      showSuccessLocal('Subrama eliminada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantId, groupSlug, loadRamas, handleError, showSuccessLocal]);

  // Acciones de galería para Secciones (Ramas)
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const addGalleryImage = useCallback(async (sectionId: string, file: File) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
  await organigramaService.addGalleryImage(tenantId, groupSlug, sectionId, file);
  await loadRamas({ force: true });
      showSuccessLocal('Imagen agregada a la galería');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantId, groupSlug, loadRamas, showSuccessLocal, handleError]);

  const replaceGalleryImage = useCallback(async (sectionId: string, targetUuid: string, newFile: File) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
  await organigramaService.replaceGalleryImage(tenantId, groupSlug, sectionId, targetUuid, newFile);
  await loadRamas({ force: true });
      showSuccessLocal('Imagen de galería reemplazada');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantId, groupSlug, loadRamas, showSuccessLocal, handleError]);

  const removeGalleryImage = useCallback(async (sectionId: string, targetUuidOrUrl: string, deleteFromStorage = false) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
  const result = await organigramaService.deleteGalleryImageById(tenantId, groupSlug, sectionId, targetUuidOrUrl, deleteFromStorage);
  await loadRamas({ force: true });
      
      if (deleteFromStorage) {
        if (result) {
          showSuccessLocal('Imagen eliminada físicamente de la galería y del servidor');
        } else {
          showSuccessLocal('Imagen removida de la galería. La eliminación física del archivo puede tardar o fallar; si necesitas borrarlo permanentemente, contacta al administrador.');
        }
      } else {
        showSuccessLocal('Imagen removida de la galería. El archivo permanece en el servidor y puede ser reagregado más tarde.');
      }
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantId, groupSlug, loadRamas, showSuccessLocal, handleError]);

  const removeImageFromGalleryOnly = useCallback(async (sectionId: string, targetUuidOrUrl: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingGallery(true);
    try {
  await organigramaService.removeGalleryImage(tenantId, groupSlug, sectionId, targetUuidOrUrl);
  await loadRamas({ force: true });
      showSuccessLocal('Imagen removida de la galería. El archivo permanece en el servidor y puede ser reagregado más tarde.');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingGallery(false);
    }
  }, [tenantId, groupSlug, loadRamas, showSuccessLocal, handleError]);

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
    removeImageFromGalleryOnly,
    isLoadingGallery,
  };
}

export default useOrganigramaActions;

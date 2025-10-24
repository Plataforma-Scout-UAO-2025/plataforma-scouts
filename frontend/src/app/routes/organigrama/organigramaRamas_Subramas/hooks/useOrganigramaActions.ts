import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setPhotoPrincipalAction, deletePhotoPrincipalAction, setSubgroupPhotoPrincipalAction, deleteSubgroupPhotoPrincipalAction } from '@/store/organigrama/organigramaActions';
import { uploadPhotoFile } from '@/lib/imageUtils';
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
  const dispatch = useAppDispatch();
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

  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const [isLoadingPhotoPrincipal, setIsLoadingPhotoPrincipal] = useState(false);

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

  const setPhotoPrincipal = useCallback(async (sectionId: string, objectId: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      await dispatch(setPhotoPrincipalAction({ tenantId, groupSlug, sectionId, objectId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal establecida');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

  const deletePhotoPrincipal = useCallback(async (sectionId: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      await dispatch(deletePhotoPrincipalAction({ tenantId, groupSlug, sectionId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal eliminada');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

  const uploadPhotoPrincipal = useCallback(async (sectionId: string, file: File, onProgress?: (percent: number) => void) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      const objectId = await uploadPhotoFile(file, onProgress);
      await dispatch(setPhotoPrincipalAction({ tenantId, groupSlug, sectionId, objectId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal subida');
      return objectId;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

  const setSubgroupPhotoPrincipal = useCallback(async (sectionId: string, subgroupId: string, objectId: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      await dispatch(setSubgroupPhotoPrincipalAction({ tenantId, groupSlug, sectionId, subgroupId, objectId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal de subgrupo establecida');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

  const deleteSubgroupPhotoPrincipal = useCallback(async (sectionId: string, subgroupId: string) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      await dispatch(deleteSubgroupPhotoPrincipalAction({ tenantId, groupSlug, sectionId, subgroupId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal de subgrupo eliminada');
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

  const uploadSubgroupPhotoPrincipal = useCallback(async (sectionId: string, subgroupId: string, file: File, onProgress?: (percent: number) => void) => {
    if (!tenantId || !groupSlug) throw new Error('Tenant o group no disponibles');
    setIsLoadingPhotoPrincipal(true);
    try {
      const objectId = await uploadPhotoFile(file, onProgress);
      await dispatch(setSubgroupPhotoPrincipalAction({ tenantId, groupSlug, sectionId, subgroupId, objectId }));
      await loadRamas({ force: true });
      showSuccessLocal('Foto principal de subgrupo subida');
      return objectId;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoadingPhotoPrincipal(false);
    }
  }, [tenantId, groupSlug, dispatch, loadRamas, showSuccessLocal, handleError]);

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
    isLoadingGallery,
    // photo principal actions
    setPhotoPrincipal,
    deletePhotoPrincipal,
    uploadPhotoPrincipal,
    setSubgroupPhotoPrincipal,
    deleteSubgroupPhotoPrincipal,
    uploadSubgroupPhotoPrincipal,
    isLoadingPhotoPrincipal,
  };
}

export default useOrganigramaActions;
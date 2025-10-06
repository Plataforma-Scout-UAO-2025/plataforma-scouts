import { useCallback, useRef, useState, useEffect } from 'react';
import * as organigramaService from '../services';
import type { CreateRamaData } from '../types/rama.type';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from '../schemas/rama.schema';

type ActionsParams = {
  tenantSlug?: string;
  groupSlug?: string;
  loadRamas: () => Promise<void>;
  showSuccess?: (msg: string) => void;
  handleError: (err: any) => void;
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
    } catch (e) {
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

  const createRama = useCallback(async (data: CreateRamaData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      await organigramaService.createRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccessLocal('Rama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

  const updateRama = useCallback(async (data: UpdateRamaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      // @ts-ignore
      await organigramaService.updateRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccessLocal('Rama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

  const createSubrama = useCallback(async (data: CreateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      await organigramaService.createSubrama(tenantSlug, groupSlug, data.ramaId, data);
      await loadRamas();
      showSuccessLocal('Subrama creada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

  const updateSubrama = useCallback(async (data: UpdateSubramaFormData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      // @ts-ignore
      await organigramaService.updateSubrama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccessLocal('Subrama actualizada con éxito');
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

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
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

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
  }, [tenantSlug, groupSlug, loadRamas, showSuccess, handleError]);

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
  };
}

export default useOrganigramaActions;

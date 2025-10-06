import { useCallback } from 'react';
import * as organigramaService from '../services';
import type { CreateRamaData } from '../types/rama.type';
import type { CreateSubramaFormData, UpdateRamaFormData, UpdateSubramaFormData } from '../schemas/rama.schema';

type ActionsParams = {
  tenantSlug?: string;
  groupSlug?: string;
  loadRamas: () => Promise<void>;
  showSuccess: (msg: string) => void;
  handleError: (err: any) => void;
};

export function useOrganigramaActions({ tenantSlug, groupSlug, loadRamas, showSuccess, handleError }: ActionsParams) {
  const createRama = useCallback(async (data: CreateRamaData) => {
    try {
      if (!tenantSlug || !groupSlug) throw new Error('Tenant o group no disponibles');
      await organigramaService.createRama(tenantSlug, groupSlug, data);
      await loadRamas();
      showSuccess('Rama creada con éxito');
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
      showSuccess('Rama actualizada con éxito');
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
      showSuccess('Subrama creada con éxito');
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
      showSuccess('Subrama actualizada con éxito');
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
      showSuccess('Rama eliminada con éxito');
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
      showSuccess('Subrama eliminada con éxito');
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
  };
}

export default useOrganigramaActions;

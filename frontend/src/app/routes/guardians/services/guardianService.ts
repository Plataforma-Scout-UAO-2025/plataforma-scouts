import {
    addMemberToGuardian,
    createGuardian,
    deleteGuardian,
    getGuardianById,
    getGuardianWithMembers,
    getMembersInChargeOf,
    removeMemberFromGuardian,
    updateGuardian
} from '@/api/guardiansApi';
import type { 
  Guardian, 
  GuardianWithMembers,
  GuardianCompleteData,
  UpdateGuardianDTO,
  MemberBasicInfo
} from '@/types/guardian.type';

// Helper: Extraer status code de un error (si existe)
function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  // Verificar si el error tiene una propiedad 'response'
  const candidate = error as { response?: unknown };
  if (!candidate.response || typeof candidate.response !== 'object') return undefined;

  const resp = candidate.response as { status?: unknown };
  if (typeof resp.status === 'number') return resp.status;

  return undefined;
}

export const guardianService = {

  getGuardianById: async (guardianId: number | string): Promise<Guardian | null> => {
    try {
        return await getGuardianById(guardianId);
    } catch (error) {
      const status = getErrorStatus(error);
      if (status === 404) {
        return null;
      }
      console.error('Error obteniendo guardian:', error);
      throw error;
    }
  },

  getGuardianWithMembers: async (guardianId: number | string): Promise<GuardianWithMembers | null> => {
    try {
        return await getGuardianWithMembers(guardianId);
    } catch (error) {
      const status = getErrorStatus(error);
      if (status === 404) {
        return null;
      }
      console.error('Error obteniendo guardian con miembros:', error);
      throw error;
    }
  },

  // Obtener lista de miembros a cargo
  getMembersInChargeOf: async (guardianId: number | string): Promise<MemberBasicInfo[]> => {
    try {
        return await getMembersInChargeOf(guardianId);
    } catch (error) {
      console.error('Error obteniendo miembros a cargo:', error);
      throw error;
    }
  },

  // Verificar si los datos del guardian están completos
  verifyCompleteData: async (guardianId: number | string): Promise<boolean> => {
    try {
      const guardian = await guardianService.getGuardianById(guardianId);
      
      if (!guardian) {
        return false;
      }

      const camposRequeridos = [
        guardian.identification,
        guardian.document_type,
        guardian.phone,
      ];

      return camposRequeridos.every(campo => !!campo && String(campo).trim() !== '');
    } catch (error) {
      console.error('Error verificando datos del guardian:', error);
      return false;
    }
  },

  // Actualizar datos del guardian
  updateData: async (guardianId: number | string, datos: UpdateGuardianDTO): Promise<void> => {
    try {
      await updateGuardian(guardianId, datos);
    } catch (error) {
      console.error('Error actualizando datos del guardian:', error);
      throw error;
    }
  },

 // Crear un nuevo guardian (alias para compatibilidad)
  createGuardian: async (data: GuardianCompleteData): Promise<GuardianCompleteData> => {
    try {
      return await createGuardian(data);
    } catch (error) {
      console.error('Error creating guardian:', error);
      throw error;
    }
  },

  // Agregar un miembro al guardian
  addMemberToGuardian: async (guardianId: number | string, memberId: number | string): Promise<void> => {
    try {
      await addMemberToGuardian(guardianId, memberId);
    } catch (error) {
      console.error('Error agregando miembro al guardian:', error);
      throw error;
    }
  },

  // Remover un miembro del guardian
  removeMemberFromGuardian: async (guardianId: number | string, memberId: number | string): Promise<void> => {
    try {
      await removeMemberFromGuardian(guardianId, memberId);
    } catch (error) {
      console.error('Error removiendo miembro del guardian:', error);
      throw error;
    }
  },

  // Eliminar un guardian
  deleteGuardian: async (guardianId: number | string): Promise<void> => {
    try {
      await deleteGuardian(guardianId);
    } catch (error) {
      console.error('Error eliminando guardian:', error);
      throw error;
    }
  },
};

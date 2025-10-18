import { 
  getGuardianById, 
  getGuardianWithMembers,
  getMembersInChargeOf,
  updateGuardian, 
  createGuardian,
  addMemberToGuardian,
  removeMemberFromGuardian,
  deleteGuardian
} from '@/api/guardiansApi';
import type { 
  Guardian, 
  GuardianWithMembers,
  CreateGuardianDTO, 
  UpdateGuardianDTO,
  MemberBasicInfo,
  GuardianCreateResponse 
} from '@/types/guardianTypes';

// @deprecated Use Guardian from @/types/guardianTypes instead
export interface GuardianData {
  userId: string;
  tenantId: string;
  subgroupId: string;
  firstName: string;
  lastName: string;
  age?: number;
  identification: string;
  documentType?: string;
  phone: string;
  isActive: boolean;
  relationship?: string;
  status?: string;
  acceptanceDate?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  email?: string;
  membersInCharge?: Array<{
    userId: string;
    firstName: string;
    lastName: string;
  }>;
}

// @deprecated Use UpdateGuardianDTO from @/types/guardianTypes instead
export interface UpdateGuardianData {
  identification?: string;
  documentType?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  age?: number;
}

// @deprecated Use CreateGuardianDTO from @/types/guardianTypes instead
export interface CreateGuardianData {
  tenantId: string;
  subgroupId: number;
  firstName: string;
  lastName: string;
  age?: number;
  identification: string;
  documentType?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  phone: string;
  isActive?: boolean;
  relationship: string;
  status?: string;
  acceptanceDate?: string;
  memberIdsInCharge?: string[];
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export const guardianService = {
  // Obtener guardian por ID (solo datos básicos)
  getGuardianById: async (guardianId: number | string): Promise<Guardian | null> => {
    try {
      const guardian = await getGuardianById(guardianId);
      return guardian;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      console.error('Error obteniendo guardian:', error);
      throw error;
    }
  },

  // Obtener guardian con sus miembros asociados
  getGuardianWithMembers: async (guardianId: number | string): Promise<GuardianWithMembers | null> => {
    try {
      const guardian = await getGuardianWithMembers(guardianId);
      return guardian;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      console.error('Error obteniendo guardian con miembros:', error);
      throw error;
    }
  },

  // Obtener lista de miembros a cargo
  getMembersInChargeOf: async (guardianId: number | string): Promise<MemberBasicInfo[]> => {
    try {
      const members = await getMembersInChargeOf(guardianId);
      return members;
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
        guardian.documentType,
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

  // Crear un nuevo guardian
  crearGuardian: async (datos: CreateGuardianDTO): Promise<GuardianCreateResponse> => {
    try {
      const newGuardian = await createGuardian(datos);
      return newGuardian;
    } catch (error) {
      console.error('Error creando guardian:', error);
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

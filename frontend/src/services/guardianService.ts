import { getGuardianById, updateGuardian, createGuardian } from '@/api/guardiansApi';
import type { Guardian, CreateGuardianDTO } from '@/api/guardian.types';

/**
 * Interface que coincide con GuardianDTO del backend
 * @deprecated Use Guardian from @/api/guardian.types instead
 */
export interface GuardianData {
  userId: string;
  tenantId: string;
  subgroupId: string;
  firstName: string;
  lastName: string;
  age?: number;
  identification: string; // Cédula
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

/**
 * DTO para actualizar datos del guardian
 * @deprecated Use UpdateGuardianDTO from @/api/guardian.types instead
 */
export interface UpdateGuardianData {
  identification?: string;
  documentType?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  age?: number;
}

/**
 * DTO para crear un guardian completo
 * @deprecated Use CreateGuardianDTO from @/api/guardian.types instead
 */
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

/**
 * Servicio para interactuar con los endpoints de guardians/acudientes
 * 
 * Este servicio agrega lógica de negocio adicional sobre las funciones base de la API.
 * Para operaciones simples de API, usar directamente las funciones de @/api/guardiansApi
 */
export const guardianService = {
  /**
   * Obtener un guardian específico por ID
   * @param guardianId - ID del guardian (userId)
   */
  getGuardianById: async (guardianId: string): Promise<Guardian | null> => {
    try {
      const guardian = await getGuardianById(guardianId);
      return guardian;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null; // Guardian no encontrado
      }
      console.error('Error obteniendo guardian:', error);
      throw error;
    }
  },

  /**
   * Verificar si los datos del guardian están completos
   * Verifica que tenga todos los campos requeridos excepto relationship
   * @param guardianId - ID del guardian (userId)
   */
  verifyCompleteData: async (guardianId: string): Promise<boolean> => {
    try {
      const guardian = await guardianService.getGuardianById(guardianId);
      
      if (!guardian) {
        return false; // No existe el guardian
      }

      // Verificar que tenga todos los campos requeridos
      const camposRequeridos = [
        guardian.identification,
        guardian.documentType,
        guardian.phone,
        guardian.address,
        guardian.gender,
        guardian.birthDate,
      ];

      // Todos los campos deben existir y no estar vacíos
      return camposRequeridos.every(campo => !!campo && String(campo).trim() !== '');
    } catch (error) {
      console.error('Error verificando datos del guardian:', error);
      return false;
    }
  },

  /**
   * Actualizar datos del guardian
   * @param guardianId - ID del guardian (userId)
   * @param datos - Datos a actualizar
   */
  updateData: async (guardianId: string, datos: UpdateGuardianData): Promise<Guardian> => {
    try {
      // Primero obtenemos el guardian actual
      const guardianActual = await guardianService.getGuardianById(guardianId);
      
      if (!guardianActual) {
        throw new Error('Guardian no encontrado');
      }

      // Construimos el objeto completo para el PUT (GuardianCreateDTO del backend)
      const guardianActualizado: CreateGuardianData = {
        tenantId: guardianActual.tenantId,
        subgroupId: typeof guardianActual.subgroupId === 'string' 
          ? parseInt(guardianActual.subgroupId) 
          : guardianActual.subgroupId,
        firstName: guardianActual.firstName,
        lastName: guardianActual.lastName,
        age: datos.age || guardianActual.age,
        identification: datos.identification || guardianActual.identification,
        documentType: datos.documentType || guardianActual.documentType,
        phone: datos.phone || guardianActual.phone,
        address: datos.address || guardianActual.address,
        gender: datos.gender || guardianActual.gender,
        birthDate: datos.birthDate || guardianActual.birthDate,
        email: guardianActual.email,
        isActive: guardianActual.isActive,
        relationship: guardianActual.relationship || '',
        status: guardianActual.status,
        acceptanceDate: guardianActual.acceptanceDate,
      };

      // Enviamos el PUT usando la función de la API
      const updated = await updateGuardian(guardianId, guardianActualizado as any);
      return updated;
    } catch (error) {
      console.error('Error actualizando datos del guardian:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo guardian
   * @param datos - Datos del guardian a crear
   */
  crearGuardian: async (datos: CreateGuardianData): Promise<Guardian> => {
    try {
      const newGuardian = await createGuardian(datos as CreateGuardianDTO);
      return newGuardian;
    } catch (error) {
      console.error('Error creando guardian:', error);
      throw error;
    }
  },
};

import type { 
  Subgroup as Subrama,
  CreateSubgroupData as CreateSubramaData, 
  UpdateSubgroupData as UpdateSubramaData, 
} from '../types/frontend';

import { getSubgroups, createSubgroup, updateSubgroup, deleteSubgroup } from '@/api/organigramaApi';
import { 
  mapBackendSubramaToFrontend,
  mapFrontendCreateSubramaToBackend,
  mapFrontendUpdateSubramaToBackend
} from '../utils/mappers';
import type { Subgroup as SubgroupDTO } from '@/types/subgroup-simple.type';

type MaybeAxiosError = { response?: { data?: unknown; status?: number }; status?: number; code?: string };

export const getSubramasByRamaId = async (tenantId: string, groupSlug: string, ramaId: string): Promise<Subrama[]> => {
  const normalizedRamaId = typeof ramaId === 'string' ? ramaId.trim() : String(ramaId ?? '').trim();

  if (!normalizedRamaId) {
    console.warn(' [SubramaService] Rama sin ID válido, se omite la consulta de subramas.');
    return [];
  }

  try {
    const backendSubramas = await getSubgroups(normalizedRamaId, tenantId, groupSlug) as SubgroupDTO[];
    const subramas = (Array.isArray(backendSubramas) ? backendSubramas : []).map(mapBackendSubramaToFrontend);
    return subramas;
  } catch (error) {
    console.error(' [SubramaService] Error obteniendo subramas:', error);
    throw error;
  }
};

/**
 * Recomendación de uso para compañeros:
 * - Si dispones de `sectionId` (id de la rama) y `subgroupId`, llama directamente al endpoint:
 *     await organigramaClient.getSubgroupRaw(sectionId, subgroupId, tenantId, groupSlug)
 *   Esto obtiene la subrama exacta desde el backend.
 *
 * - Si NO tienes `sectionId`:
 *   - Si lo que necesitas son los miembros del subgrupo, puedes usar:
 *       await organigramaClient.getMembersBySubgroup(Number(subgroupId))
 *     (no requiere sectionId)
 *   - Si necesitas la entidad Subgroup, intenta primero localizar `sectionId` en el store/UI
 *     o recorrer las subramas de la sección conocida y filtrar por id:
 *       const subs = await organigramaClient.getSubgroups(sectionIdCandidate, tenantId, groupSlug)
 *       const found = subs.find(s => String(s.id ?? s.subgroupId ?? s.subgroup_id) === String(subgroupId))
 *   - Si este flujo es frecuente, pedir al backend un endpoint que busque subgrupo por id global sería ideal.
 *
 * Nota: Este servicio actualmente implementa la búsqueda vía `getSubgroupsRaw(sectionId, ...)` y filtrado
 * porque no existe un endpoint global que reciba solo `subgroupId` y retorne la subrama.
 */

export const getSubramaById = async (tenantId: string, groupSlug: string, sectionId: string, id: string): Promise<Subrama | null> => {
  try {
    const backendSubramas = await getSubgroups(sectionId, tenantId, groupSlug) as SubgroupDTO[];
    const found = (Array.isArray(backendSubramas) ? backendSubramas : []).find((s) => {
      const rec = s as unknown as Record<string, unknown>;
      const candidateId = String(rec['id'] ?? rec['objectId'] ?? '');
      return candidateId === String(id);
    });
    if (!found) return null;
    return mapBackendSubramaToFrontend(found);
  } catch (error) {
    console.error(' [SubramaService] Error obteniendo subrama por ID:', error);
    return null;
  }
};

export const createSubrama = async (tenantId: string, groupSlug: string, sectionId: string, data: CreateSubramaData): Promise<Subrama | null> => {
  try {
    const backendData = mapFrontendCreateSubramaToBackend(data);
    const backendSubrama = await createSubgroup(sectionId, backendData, tenantId, groupSlug) as SubgroupDTO;
    const subrama = mapBackendSubramaToFrontend(backendSubrama as SubgroupDTO);
    return subrama;
  } catch (error: unknown) {
    console.error(' [SubramaService] Error creando subrama:', error);
    throw error;
  }
};

export const updateSubrama = async (tenantId: string, groupSlug: string, data: UpdateSubramaData): Promise<Subrama | null> => {
  try {
    const maybe = data as unknown as Record<string, unknown>;
    const sectionId = (maybe['branchId'] as string | undefined) ?? (maybe['ramaId'] as string | undefined) ?? (maybe['section_id'] as string | undefined) ?? '';
    if (!sectionId) {
      throw new Error('ramaId/branchId es requerido para actualizar subrama');
    }
    const backendData = mapFrontendUpdateSubramaToBackend(data);
    const backendSubrama = await updateSubgroup(sectionId, data.id, backendData, tenantId, groupSlug) as SubgroupDTO;
    return mapBackendSubramaToFrontend(backendSubrama as SubgroupDTO);
  } catch (error: unknown) {
    console.error(' [SubramaService] Error actualizando subrama:', error);
    throw error;
  }
};

export const deleteSubrama = async (tenantId: string, groupSlug: string, sectionId: string, id: string): Promise<boolean> => {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.debug('[SubramaService] DELETE subrama via client:', { sectionId, id, attempt });
      await deleteSubgroup(sectionId, id, tenantId, groupSlug);
      return true;
    } catch (error: unknown) {
      console.error(' [SubramaService] Error eliminando subrama (attempt ' + attempt + '):', error);
      try {
        const maybe = error as MaybeAxiosError;
        if (maybe.response && maybe.response.data) {
          console.error(' [SubramaService] Respuesta del backend (delete):', maybe.response.data);
        }
      } catch (errLogging) {
        // Log the secondary error to avoid unused-variable lint issues
        console.debug(' [SubramaService] Secondary logging error:', errLogging);
      }

      const maybe = error as MaybeAxiosError;
      const status = maybe?.response?.status ?? maybe?.status;
      const isServerError = status === 500 || maybe?.code === 'ERR_BAD_RESPONSE';

      if (attempt < maxRetries && isServerError) {
        const delayMs = 300 * (attempt + 1);
        console.debug(`[SubramaService] Retry delete in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }

      throw error;
    }
  }
  return false;
};
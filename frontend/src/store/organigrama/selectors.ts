import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { CACHE_CONFIG } from '@/app/routes/organigrama/organigramaRamas_Subramas/utils/ramasProcessor';

// Selector básico para el estado de organigrama
export const selectOrganigrama = (state: RootState) => state.organigrama;

// Selector básico para miembros (para conteo)
export const selectMembers = (state: RootState) => state.members?.members || [];

// Selector memoizado para ramas
export const selectRamas = createSelector(
  [selectOrganigrama],
  (organigrama) => organigrama.ramas || []
);

// Selector para loading state de ramas
export const selectRamasLoading = createSelector(
  [selectOrganigrama],
  (organigrama) => organigrama.ramasLoading || false
);

// Selector para error state de ramas
export const selectRamasError = createSelector(
  [selectOrganigrama],
  (organigrama) => organigrama.ramasError
);

// Selector para timestamp de última carga
export const selectRamasLastFetch = createSelector(
  [selectOrganigrama],
  (organigrama) => organigrama.ramasLastFetch || 0
);

// Selector completo con validación de cache
export const selectRamasWithCacheValidation = createSelector(
  [selectRamas, selectRamasLoading, selectRamasError, selectRamasLastFetch],
  (ramas, isLoading, error, lastFetch) => {
    const now = Date.now();
    const isExpired = lastFetch > 0 && (now - lastFetch) > CACHE_CONFIG.RAMAS_TTL;
    const hasData = ramas.length > 0;
    const isCached = hasData && !isExpired;
    const needsRefresh = !hasData || isExpired;

    return {
      ramas,
      isLoading,
      error,
      lastFetch,
      isCached,
      isExpired,
      needsRefresh,
      hasData,
    };
  }
);

// Selector para determinar si debe hacer fetch
export const selectShouldFetchRamas = createSelector(
  [selectRamasWithCacheValidation],
  (ramasState) => ramasState.needsRefresh && !ramasState.isLoading
);

// Selector para contar miembros por subgrupo (optimizado)
export const selectMemberCountBySubgroup = createSelector(
  [selectMembers],
  (members) => {
    // Crear un mapa de conteo para optimizar búsquedas
    const countMap = new Map<number, number>();
    
    members.forEach(member => {
      const memberSubgroupId = 
        member.subgroup_id ?? 
        member.subgroup?.subgroupId ?? 
        member.subgroup?.subgroup_id;
      
      if (memberSubgroupId !== undefined && memberSubgroupId !== null) {
        const subgroupIdNum = Number(memberSubgroupId);
        if (Number.isFinite(subgroupIdNum)) {
          countMap.set(subgroupIdNum, (countMap.get(subgroupIdNum) || 0) + 1);
        }
      }
    });

    // Retornar función que usa el mapa pre-calculado
    return (subgroupId: string | number): number => {
      const subgroupIdNum = Number(subgroupId);
      if (!Number.isFinite(subgroupIdNum)) return 0;
      return countMap.get(subgroupIdNum) || 0;
    };
  }
);

// Selector para estadísticas de cache
export const selectRamasCacheStats = createSelector(
  [selectRamasWithCacheValidation],
  (ramasState) => ({
    hasCache: ramasState.hasData,
    isValid: ramasState.isCached,
    isExpired: ramasState.isExpired,
    lastFetchTime: ramasState.lastFetch,
    cacheAge: ramasState.lastFetch > 0 ? Date.now() - ramasState.lastFetch : 0,
    ttl: CACHE_CONFIG.RAMAS_TTL,
  })
);
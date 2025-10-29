import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import type { Branch as Rama } from "@/app/routes/organigrama/organigramaRamas_Subramas/types/frontend";

// Configuración del cache
const CACHE_CONFIG = {
  RAMAS_TTL: 30 * 1000, // 30 segundos
} as const;

interface CachedRamas {
  data: Rama[];
  lastFetch: number;
  tenantId: string;
  groupSlug: string;
}

interface OrganigramaCacheState {
  ramas: {
    [key: string]: CachedRamas;
  };
}

const initialState: OrganigramaCacheState = {
  ramas: {},
};

const organigramaCacheSlice = createSlice({
  name: "organigramaCache",
  initialState,
  reducers: {
    // Guardar ramas en cache
    setRamasCache: (
      state,
      action: PayloadAction<{
        tenantId: string;
        groupSlug: string;
        ramas: Rama[];
      }>
    ) => {
      const { tenantId, groupSlug, ramas } = action.payload;
      const cacheKey = `${tenantId}::${groupSlug}`;
      
      state.ramas[cacheKey] = {
        data: ramas,
        lastFetch: Date.now(),
        tenantId,
        groupSlug,
      };
    },

    // Invalidar cache específico
    invalidateRamasCache: (
      state,
      action: PayloadAction<{
        tenantId: string;
        groupSlug: string;
      }>
    ) => {
      const { tenantId, groupSlug } = action.payload;
      const cacheKey = `${tenantId}::${groupSlug}`;
      delete state.ramas[cacheKey];
    },

    // Limpiar todo el cache
    clearAllCache: (state) => {
      state.ramas = {};
    },

    // Limpiar cache expirado
    clearExpiredCache: (state) => {
      const now = Date.now();
      Object.keys(state.ramas).forEach(key => {
        const cached = state.ramas[key];
        if (cached && (now - cached.lastFetch) > CACHE_CONFIG.RAMAS_TTL) {
          delete state.ramas[key];
        }
      });
    },
  },
});

// Selectores memoizados
export const selectRamasCache = (tenantId: string, groupSlug: string) =>
  createSelector(
    [(state: { organigramaCache?: OrganigramaCacheState }) => state.organigramaCache],
    (organigramaCache) => {
      if (!organigramaCache) return null;
      
      const cacheKey = `${tenantId}::${groupSlug}`;
      const cached = organigramaCache.ramas[cacheKey];
      
      if (!cached) return null;
      
      const now = Date.now();
      const isExpired = (now - cached.lastFetch) > CACHE_CONFIG.RAMAS_TTL;
      
      return {
        ...cached,
        isExpired,
        isValid: !isExpired,
      };
    }
  );

export const selectCacheStats = createSelector(
  [(state: { organigramaCache?: OrganigramaCacheState }) => state.organigramaCache],
  (organigramaCache) => {
    if (!organigramaCache) return { totalEntries: 0, expiredEntries: 0 };
    
    const now = Date.now();
    const entries = Object.values(organigramaCache.ramas);
    const expiredEntries = entries.filter(
      entry => (now - entry.lastFetch) > CACHE_CONFIG.RAMAS_TTL
    );
    
    return {
      totalEntries: entries.length,
      expiredEntries: expiredEntries.length,
    };
  }
);

// Exportar acciones y reducer
export const {
  setRamasCache,
  invalidateRamasCache,
  clearAllCache,
  clearExpiredCache,
} = organigramaCacheSlice.actions;

export default organigramaCacheSlice.reducer;
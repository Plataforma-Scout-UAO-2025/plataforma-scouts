import { useCallback } from 'react';
import { exportarOrganigramaPDF, exportarOrganigramaCSV } from '../utils/exportarOrganigrama';
import type { Branch as Rama } from '../types/frontend';
import { getRamasWithSubramas } from '../services';
import { getGroupBySlug } from '@/api/organigramaApi';

type Opts = { tenantId?: string; groupSlug?: string };

// Filtra SOLO las 5 ramas canónicas y devuelve UNA por categoría,
// replicando la lógica de la vista (coincidencia por prefijo + selección determinista).
const filterScoutBranches = (ramas: Rama[]): Rama[] => {
  const normalize = (s: string) => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const CATS = ['cachorros', 'manada', 'webelos', 'tropa', 'clan'] as const;
  type Cat = typeof CATS[number];

  // Agrupar por categoría detectada por prefijo
  const groups: Record<Cat, Rama[]> = { cachorros: [], manada: [], webelos: [], tropa: [], clan: [] };
  ramas.forEach((rama) => {
    const n = normalize(String(rama.name || rama.nombre || ''));
    const cat = CATS.find((c) => n.startsWith(c));
    if (cat) groups[cat].push(rama);
  });

  // Seleccionar representante por categoría:
  // 1) Coincidencia exacta con nombre canónico (normalizado)
  // 2) Si no hay exacta, la más antigua por createdAt
  // 3) Si no hay fecha válida, orden alfabético como desempate
  const pickRepresentative = (list: Rama[], token: Cat): Rama | undefined => {
    if (!list || list.length === 0) return undefined;
    const exact = list.find((r) => normalize(String(r.name || r.nombre || '')) === token);
    if (exact) return exact;
    const parseTs = (r: Rama) => {
      const t = Date.parse(r.createdAt || '');
      return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
    };
    return list
      .slice()
      .sort((a, b) => {
        const at = parseTs(a);
        const bt = parseTs(b);
        if (at !== bt) return at - bt;
        const an = String(a.name || a.nombre || '');
        const bn = String(b.name || b.nombre || '');
        return an.localeCompare(bn, 'es');
      })[0];
  };

  // Construir resultado en el orden canónico
  const result: Rama[] = [];
  for (const cat of CATS) {
    const chosen = pickRepresentative(groups[cat], cat);
    if (chosen) result.push(chosen);
  }
  return result;
};

// Función para ordenar ramas según el orden scout
const sortRamas = (ramas: Rama[]): Rama[] => {
  const ordenRamas = ['cachorros', 'manada', 'webelos', 'tropa', 'clan'];
  
  return ramas.sort((a, b) => {
    const nameA = String(a.name || a.nombre || '').toLowerCase();
    const nameB = String(b.name || b.nombre || '').toLowerCase();
    
    const indexA = ordenRamas.findIndex(orden => nameA.includes(orden));
    const indexB = ordenRamas.findIndex(orden => nameB.includes(orden));
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return nameA.localeCompare(nameB);
  });
};

export function useOrganigramaExport(ramas: Rama[], opts?: Opts) {
  const exportPDF = useCallback(async () => {
    console.log(' [useOrganigramaExport] Iniciando exportación PDF');
    
    let data = ramas;
    let groupName = '';
    
    
    if (opts?.tenantId && opts?.groupSlug) {
      console.log(' [useOrganigramaExport] Obteniendo datos frescos del backend para PDF...');
      console.log(' [useOrganigramaExport] Parámetros:', { tenantId: opts.tenantId, groupSlug: opts.groupSlug });

      try {
        // Get group name for the title
        const groupInfo = await getGroupBySlug(opts.tenantId!, opts.groupSlug!);
        groupName = groupInfo?.name || '';
        
        const fetched = await getRamasWithSubramas(opts.tenantId!, opts.groupSlug!);
        
        if (fetched && fetched.length > 0) {
          console.log(' [useOrganigramaExport] Datos del backend obtenidos exitosamente para PDF:', fetched.length, 'ramas');
          data = fetched;
        } else {
          console.warn(' [useOrganigramaExport] Backend devolvió datos vacíos, usando datos locales como fallback');
        }
      } catch (e) {
        console.error(' [useOrganigramaExport] Error obteniendo datos del backend para PDF:', e);
        console.log(' [useOrganigramaExport] Usando datos locales como fallback para PDF');
        
        if ((e as Error & { status?: number; response?: { status?: number } })?.status === 403 || 
            (e as Error & { status?: number; response?: { status?: number } })?.response?.status === 403) {
          console.warn(' [useOrganigramaExport] Error 403: Problema de autenticación. Verificar permisos o tokens.');
        }
        
      }
    } else {
      console.warn(' [useOrganigramaExport] No se proporcionaron tenantId/groupSlug, usando datos locales para PDF');
    }

    // Aplicar filtrado y ordenamiento
    data = filterScoutBranches(data);
    data = sortRamas(data);

    console.log(' [useOrganigramaExport] Generando PDF con', data.length, 'ramas filtradas');
    await exportarOrganigramaPDF(data, { colorHex: '#1A4134', groupName });
  }, [ramas, opts]);

  const exportExcel = useCallback(async () => {
    console.log(' [useOrganigramaExport] Iniciando exportación CSV');
    
    let data = ramas;
    
    if (opts?.tenantId && opts?.groupSlug) {
      console.log(' [useOrganigramaExport] Obteniendo datos frescos del backend para CSV...');
      console.log(' [useOrganigramaExport] Parámetros:', { tenantId: opts.tenantId, groupSlug: opts.groupSlug });

      try {
        const fetched = await getRamasWithSubramas(opts.tenantId!, opts.groupSlug!);
        
        if (fetched && fetched.length > 0) {
          console.log(' [useOrganigramaExport] Datos del backend obtenidos exitosamente para CSV:', fetched.length, 'ramas');
          data = fetched;
        } else {
          console.warn(' [useOrganigramaExport] Backend devolvió datos vacíos, usando datos locales como fallback');
        }
      } catch (e) {
        console.error(' [useOrganigramaExport] Error obteniendo datos del backend para CSV:', e);
        console.log(' [useOrganigramaExport] Usando datos locales como fallback para CSV');
        
        if ((e as Error & { status?: number; response?: { status?: number } })?.status === 403 || 
            (e as Error & { status?: number; response?: { status?: number } })?.response?.status === 403) {
          console.warn(' [useOrganigramaExport] Error 403: Problema de autenticación. Verificar permisos o tokens.');
        }
      }
    } else {
      console.warn(' [useOrganigramaExport] No se proporcionaron tenantId/groupSlug, usando datos locales para CSV');
    }
    
    // Aplicar filtrado y ordenamiento
    data = filterScoutBranches(data);
    data = sortRamas(data);

    console.log(' [useOrganigramaExport] Generando CSV con', data.length, 'ramas filtradas');
    await exportarOrganigramaCSV(data);
  }, [ramas, opts]);

  return {
    exportPDF,
    exportExcel,
    hasBackendConfig: Boolean(opts?.tenantId && opts?.groupSlug),
    localRamasCount: ramas.length,
  };
}

export default useOrganigramaExport;
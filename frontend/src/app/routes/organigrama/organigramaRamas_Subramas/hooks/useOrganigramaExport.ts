import { useCallback } from 'react';
import { exportarOrganigramaPDF, exportarOrganigramaCSV } from '../utils/exportarOrganigrama';
import type { Branch as Rama } from '../types/frontend';
import { getRamasWithSubramas } from '../services';

type Opts = { tenantId?: string; groupSlug?: string };

export function useOrganigramaExport(ramas: Rama[], opts?: Opts) {
  const exportPDF = useCallback(async () => {
    console.log(' [useOrganigramaExport] Iniciando exportación PDF');
    
    let data = ramas;
    
    
    if (opts?.tenantId && opts?.groupSlug) {
      console.log(' [useOrganigramaExport] Obteniendo datos frescos del backend para PDF...');
      console.log(' [useOrganigramaExport] Parámetros:', { tenantId: opts.tenantId, groupSlug: opts.groupSlug });

      try {
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

    console.log(' [useOrganigramaExport] Generando PDF con', data.length, 'ramas');
    exportarOrganigramaPDF(data, { colorHex: '#1A4134' });
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
    
    console.log(' [useOrganigramaExport] Generando CSV con', data.length, 'ramas');
    exportarOrganigramaCSV(data);
  }, [ramas, opts]);

  return {
    exportPDF,
    exportExcel,
    hasBackendConfig: Boolean(opts?.tenantId && opts?.groupSlug),
    localRamasCount: ramas.length,
  };
}

export default useOrganigramaExport;

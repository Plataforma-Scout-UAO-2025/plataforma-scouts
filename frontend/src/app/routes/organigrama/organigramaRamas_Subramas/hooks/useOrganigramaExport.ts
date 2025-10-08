import { useCallback } from 'react';
import { exportarOrganigramaPDF, exportarOrganigramaCSV } from '../utils/exportarOrganigrama';
import type { Branch as Rama } from '../types/frontend';
import { getRamasWithSubramas } from '../services';

type Opts = { tenantSlug?: string; groupSlug?: string };

export function useOrganigramaExport(ramas: Rama[], selectedYear?: string, opts?: Opts) {
  const exportPDF = useCallback(async () => {
    console.log('🔄 [useOrganigramaExport] Iniciando exportación PDF');
    
    let data = ramas;
    
    // SIEMPRE intentar obtener datos frescos del backend si tenemos los parámetros necesarios
    if (opts?.tenantSlug && opts?.groupSlug) {
      console.log('📡 [useOrganigramaExport] Obteniendo datos frescos del backend para PDF...');
      console.log('📡 [useOrganigramaExport] Parámetros:', { 
        tenantSlug: opts.tenantSlug, 
        groupSlug: opts.groupSlug, 
        year: selectedYear 
      });
      
      try {
        const fetched = await getRamasWithSubramas(
          opts.tenantSlug, 
          opts.groupSlug, 
          selectedYear ? parseInt(selectedYear) : undefined
        );
        
        if (fetched && fetched.length > 0) {
          console.log('✅ [useOrganigramaExport] Datos del backend obtenidos exitosamente para PDF:', fetched.length, 'ramas');
          data = fetched;
        } else {
          console.warn('⚠️ [useOrganigramaExport] Backend devolvió datos vacíos, usando datos locales como fallback');
        }
      } catch (e) {
        console.error('❌ [useOrganigramaExport] Error obteniendo datos del backend para PDF:', e);
        console.log('🔄 [useOrganigramaExport] Usando datos locales como fallback para PDF');
        
        // Si hay error 403, es un problema de autenticación/autorización
        if ((e as any)?.status === 403 || (e as any)?.response?.status === 403) {
          console.warn('🔐 [useOrganigramaExport] Error 403: Problema de autenticación. Verificar permisos o tokens.');
        }
        
        // fallback a `ramas` si la petición falla
      }
    } else {
      console.warn('⚠️ [useOrganigramaExport] No se proporcionaron tenantSlug/groupSlug, usando datos locales para PDF');
    }
    
    const anio = selectedYear ? parseInt(selectedYear) : undefined;
    console.log('📄 [useOrganigramaExport] Generando PDF con', data.length, 'ramas, año:', anio);
    exportarOrganigramaPDF(data, { anio, colorHex: '#1A4134' });
  }, [ramas, selectedYear, opts]);

  const exportExcel = useCallback(async () => {
    console.log('🔄 [useOrganigramaExport] Iniciando exportación CSV');
    
    let data = ramas;
    
    // SIEMPRE intentar obtener datos frescos del backend si tenemos los parámetros necesarios
    if (opts?.tenantSlug && opts?.groupSlug) {
      console.log('📡 [useOrganigramaExport] Obteniendo datos frescos del backend para CSV...');
      console.log('📡 [useOrganigramaExport] Parámetros:', { 
        tenantSlug: opts.tenantSlug, 
        groupSlug: opts.groupSlug, 
        year: selectedYear 
      });
      
      try {
        const fetched = await getRamasWithSubramas(
          opts.tenantSlug, 
          opts.groupSlug, 
          selectedYear ? parseInt(selectedYear) : undefined
        );
        
        if (fetched && fetched.length > 0) {
          console.log('✅ [useOrganigramaExport] Datos del backend obtenidos exitosamente para CSV:', fetched.length, 'ramas');
          data = fetched;
        } else {
          console.warn('⚠️ [useOrganigramaExport] Backend devolvió datos vacíos, usando datos locales como fallback');
        }
      } catch (e) {
        console.error('❌ [useOrganigramaExport] Error obteniendo datos del backend para CSV:', e);
        console.log('🔄 [useOrganigramaExport] Usando datos locales como fallback para CSV');
        
        // Si hay error 403, es un problema de autenticación/autorización
        if ((e as any)?.status === 403 || (e as any)?.response?.status === 403) {
          console.warn('🔐 [useOrganigramaExport] Error 403: Problema de autenticación. Verificar permisos o tokens.');
        }
      }
    } else {
      console.warn('⚠️ [useOrganigramaExport] No se proporcionaron tenantSlug/groupSlug, usando datos locales para CSV');
    }
    
    console.log('📊 [useOrganigramaExport] Generando CSV con', data.length, 'ramas');
    exportarOrganigramaCSV(data);
  }, [ramas, selectedYear, opts]);

  return {
    exportPDF,
    exportExcel,
    // Propiedades adicionales para debugging/información
    hasBackendConfig: Boolean(opts?.tenantSlug && opts?.groupSlug),
    selectedYear,
    localRamasCount: ramas.length
  };
}

export default useOrganigramaExport;

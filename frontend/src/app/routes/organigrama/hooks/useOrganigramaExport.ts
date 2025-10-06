import { useCallback } from 'react';
import { exportarOrganigramaPDF, exportarOrganigramaExcel } from '../utils/exportarOrganigrama';
import type { Rama } from '../types/rama.type';

export function useOrganigramaExport(ramas: Rama[], selectedYear?: string) {
  const exportPDF = useCallback(() => {
    const anio = selectedYear ? parseInt(selectedYear) : undefined;
    exportarOrganigramaPDF(ramas, { anio, colorHex: '#1A4134' });
  }, [ramas, selectedYear]);

  const exportExcel = useCallback(() => {
    exportarOrganigramaExcel(ramas);
  }, [ramas]);

  return {
    exportPDF,
    exportExcel,
  };
}

export default useOrganigramaExport;

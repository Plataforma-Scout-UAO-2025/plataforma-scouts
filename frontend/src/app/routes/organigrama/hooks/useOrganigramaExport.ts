import { useCallback } from 'react';
import { exportarOrganigramaPDF, exportarOrganigramaExcel } from '../utils/exportarOrganigrama';
import type { Branch as Rama } from '../types/frontend';

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

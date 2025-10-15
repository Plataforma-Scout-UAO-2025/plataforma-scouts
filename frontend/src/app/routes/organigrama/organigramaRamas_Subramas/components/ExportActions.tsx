import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Table } from 'lucide-react';
import { useOrganigramaExport } from '../hooks/useOrganigramaExport';
import type { Branch as Rama } from '../types/frontend';

interface ExportActionsProps {
  ramas: Rama[];
  selectedYear?: string;
  tenantId?: string;
  groupSlug?: string;
  className?: string;
}

export function ExportActions({
  ramas,
  tenantId,
  groupSlug,
  className = ""
}: ExportActionsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const { exportPDF, exportExcel } = useOrganigramaExport(ramas, { tenantId, groupSlug });

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      setLastError(null);
      console.log(' [ExportActions] Iniciando exportación PDF...');
      await exportPDF();
      console.log(' [ExportActions] PDF exportado exitosamente');
    } catch (error) {
      console.error(' [ExportActions] Error al exportar PDF:', error);
      const errorMsg = (error as Error & { response?: { status?: number } })?.response?.status === 403 
        ? 'Error de autenticación. Verifica tus permisos.'
        : 'Error al exportar PDF. Revisa la consola para más detalles.';
      setLastError(errorMsg);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);
      setLastError(null);
      console.log(' [ExportActions] Iniciando exportación CSV...');
      await exportExcel();
      console.log(' [ExportActions] CSV exportado exitosamente');
    } catch (error) {
      console.error(' [ExportActions] Error al exportar CSV:', error);
      const errorMsg = (error as Error & { response?: { status?: number } })?.response?.status === 403 
        ? 'Error de autenticación. Verifica tus permisos.'
        : 'Error al exportar CSV. Revisa la consola para más detalles.';
      setLastError(errorMsg);
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Button
          onClick={handleExportPDF}
          disabled={isExportingPDF || ramas.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isExportingPDF ? 'Exportando...' : 'Exportar PDF'}
        </Button>

        <Button
          onClick={handleExportCSV}
          disabled={isExportingCSV || ramas.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Table className="w-4 h-4" />
          {isExportingCSV ? 'Exportando...' : 'Exportar CSV'}
        </Button>

        <div className="text-xs text-gray-500 self-center ml-2">
          {ramas.length} rama{ramas.length !== 1 ? 's' : ''}
          {tenantId && groupSlug && (
            <span className="block text-green-600">
              📡 Datos del backend
            </span>
          )}
        </div>
      </div>

      {lastError && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
           {lastError}
        </div>
      )}
    </div>
  );
}

export default ExportActions;
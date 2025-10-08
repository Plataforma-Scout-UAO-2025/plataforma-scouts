import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Table, Bug } from 'lucide-react';
import { useOrganigramaExport } from '../hooks/useOrganigramaExport';
import { debugBackendData } from '../utils/debugExport';
import type { Branch as Rama } from '../types/frontend';

interface ExportWithDescriptionExampleProps {
  tenantSlug: string;
  groupSlug: string;
}

interface EstadisticasData {
  totalRamas: number;
  ramasConDescripcion: number;
  totalSubramas: number;
  subramasConDescripcion: number;
}

export function ExportWithDescriptionExample({ tenantSlug, groupSlug }: ExportWithDescriptionExampleProps) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const { exportPDF, exportExcel } = useOrganigramaExport(
    ramas,
    '2025',
    { tenantSlug, groupSlug }
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ramas: ramasData, estadisticas: stats } = await debugBackendData(tenantSlug, groupSlug);
        setRamas(ramasData);
        setEstadisticas(stats);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenantSlug, groupSlug]);

  if (loading) {
    return <div className="p-4">Cargando datos del backend...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          📄 Exportación de Organigrama con Descripciones Reales
        </h2>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-800 mb-2">✅ Corrección Aplicada</h3>
          <p className="text-sm text-blue-700">
            La columna <strong>"EdadRango"</strong> ahora se llama <strong>"Descripción"</strong> y muestra:
          </p>
          <ul className="text-sm text-blue-700 ml-4 mt-1">
            <li>• <strong>Descripción real</strong> de la rama (del backend)</li>
            <li>• <strong>Rango de edad</strong> solo como fallback si no hay descripción</li>
          </ul>
        </div>

        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-700">{estadisticas.totalRamas}</div>
              <div className="text-sm text-gray-600">Total Ramas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-700">{estadisticas.ramasConDescripcion}</div>
              <div className="text-sm text-green-600">Con Descripción</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-700">{estadisticas.totalSubramas}</div>
              <div className="text-sm text-blue-600">Total Subramas</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-700">{estadisticas.subramasConDescripcion}</div>
              <div className="text-sm text-purple-600">Subramas c/Desc</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <Button onClick={exportPDF} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exportar PDF (con Descripciones)
          </Button>
          <Button onClick={exportExcel} variant="outline" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Exportar CSV (con Descripciones)
          </Button>
          <Button 
            onClick={() => setDebugMode(!debugMode)} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <Bug className="w-4 h-4" />
            {debugMode ? 'Ocultar' : 'Ver'} Debug
          </Button>
        </div>

        {debugMode && (
          <Card className="p-4 bg-gray-50">
            <h3 className="font-medium mb-3">🔍 Vista Previa de Datos</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {ramas.map((rama, index) => (
                <div key={rama.id} className="text-sm border-l-2 border-gray-300 pl-3">
                  <div className="font-medium">
                    {index + 1}. {rama.name ?? rama.nombre}
                  </div>
                  <div className="text-gray-600">
                    <strong>Descripción:</strong> {
                      rama.description ? 
                        `"${rama.description}" (del backend)` : 
                        `"${rama.minAge}-${rama.maxAge} años" (fallback calculado)`
                    }
                  </div>
                  {rama.subramas && rama.subramas.length > 0 && (
                    <div className="text-gray-500 text-xs mt-1">
                      ↳ {rama.subramas.length} subrama{rama.subramas.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="text-xs text-gray-500 mt-3">
          💡 <strong>Tip:</strong> Abre la consola del navegador para ver logs detallados del proceso de exportación.
        </div>
      </Card>
    </div>
  );
}

export default ExportWithDescriptionExample;
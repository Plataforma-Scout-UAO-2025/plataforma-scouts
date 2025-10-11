import { useEffect, useState } from 'react';
import { ExportActions } from '../components/ExportActions';
import { getRamasWithSubramas } from '../services';
import type { Branch as Rama } from '../types/frontend';

interface OrganigramaExportExampleProps {
  tenantSlug: string;
  groupSlug: string;
}

export function OrganigramaExportExample({ tenantSlug, groupSlug }: OrganigramaExportExampleProps) {
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRamas = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 [OrganigramaExample] Cargando ramas del backend...');
        
        const data = await getRamasWithSubramas(
          tenantSlug, 
          groupSlug, 
          parseInt(selectedYear)
        );
        
        console.log('✅ [OrganigramaExample] Ramas cargadas:', data.length);
        setRamas(data);
      } catch (err) {
        console.error('❌ [OrganigramaExample] Error cargando ramas:', err);
        setError('Error al cargar los datos del organigrama');
      } finally {
        setLoading(false);
      }
    };

    if (tenantSlug && groupSlug) {
      fetchRamas();
    }
  }, [tenantSlug, groupSlug, selectedYear]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-2">Organigrama Scout</h2>
        <p className="text-gray-600">
          Visualiza y exporta la estructura organizacional completa
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="year-select" className="text-sm font-medium">
            Año:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <ExportActions
          ramas={ramas}
          selectedYear={selectedYear}
          tenantSlug={tenantSlug}
          groupSlug={groupSlug}
        />
      </div>

      <div className="grid gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-2">Resumen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Ramas:</span>
              <div className="font-semibold">{ramas.length}</div>
            </div>
            <div>
              <span className="text-gray-500">Total Subramas:</span>
              <div className="font-semibold">
                {ramas.reduce((acc, rama) => acc + (rama.subramas?.length ?? 0), 0)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Año Seleccionado:</span>
              <div className="font-semibold">{selectedYear}</div>
            </div>
            <div>
              <span className="text-gray-500">Estado:</span>
              <div className="font-semibold text-green-600">Sincronizado</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {ramas.map((rama) => (
            <div key={rama.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{rama.name ?? rama.nombre}</h4>
                  <p className="text-sm text-gray-600">
                    {rama.subramas?.length ?? 0} subrama{(rama.subramas?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {rama.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganigramaExportExample;
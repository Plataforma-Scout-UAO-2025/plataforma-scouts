import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTenantParams } from "./organigramaRamas_Subramas/hooks/useTenantParams";
import { getRamasWithSubramas } from "./organigramaRamas_Subramas/services/rama.service";
import { useNavigate } from "react-router-dom";
import { useNiveles } from "./organigramaNivelesOrganizativos/hooks/useNiveles";
import type { OrganigramaNiveles } from "./organigramaNivelesOrganizativos/types/niveles.types";
import { exportOrgChartCombinedPDF, exportLevelsCSV, exportBranchesCSV } from "./utils/exportOrgChartCombined.ts";

type BranchLite = { id: string | number; name: string; description?: string; minAge?: number; maxAge?: number; status?: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

export default function OrgChartSummary() {
  const currentYear = new Date().getFullYear();
  const { anio, data: nivelesData, loading: nivelesLoading } = useNiveles(currentYear);
  const navigate = useNavigate();

  const [branches, setBranches] = useState<Array<{ section: BranchLite; subgroups: SubgroupLite[] }>>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { tenantId, groupSlug } = useTenantParams();
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBranchesLoading(true);
        setError(null);
        if (!tenantId || !groupSlug) {
          if (mounted) setBranches([]);
          return;
        }

        const ramas = await getRamasWithSubramas(String(tenantId), groupSlug);

        const result = (ramas || []).map((r) => {
          const rec = r as unknown as Record<string, unknown>;
          const section: BranchLite = {
            id: (rec['sectionId'] ?? rec['id'] ?? '') as string | number,
            name: String(rec['name'] ?? rec['nombre'] ?? ''),
            description:
              typeof r['description'] === 'string'
                ? String(r['description'])
                : typeof r['descripcion'] === 'string'
                ? String(r['descripcion'])
                : undefined,
            minAge:
              typeof rec['minAge'] === 'number'
                ? (rec['minAge'] as number)
                : typeof rec['edadMin'] === 'number'
                ? (rec['edadMin'] as number)
                : undefined,
            maxAge:
              typeof rec['maxAge'] === 'number'
                ? (rec['maxAge'] as number)
                : typeof rec['edadMax'] === 'number'
                ? (rec['edadMax'] as number)
                : undefined,
            status: typeof r['status'] === 'string' ? String(r['status']) : undefined,
          };

          const subsRaw = (rec['subgroups'] ?? rec['subramas'] ?? []) as unknown;
          const subgroups: SubgroupLite[] = Array.isArray(subsRaw)
            ? (subsRaw as unknown[]).map((sg) => {
                const sgRec = sg as Record<string, unknown>;
                const rawId = sgRec['subgroupId'] ?? sgRec['id'] ?? sgRec['subgroup_id'] ?? crypto.randomUUID();
                return {
                  id: rawId as string | number,
                  name: String(sgRec['name'] ?? sgRec['nombre'] ?? ''),
                  status:
                    typeof sgRec['isActive'] === 'boolean'
                      ? sgRec['isActive']
                        ? 'active'
                        : 'inactive'
                      : typeof sgRec['status'] === 'string'
                      ? String(sgRec['status'])
                      : undefined,
                  leader:
                    typeof sgRec['leader'] === 'string'
                      ? String(sgRec['leader'])
                      : typeof sgRec['jefe'] === 'string'
                      ? String(sgRec['jefe'])
                      : undefined,
                };
              })
            : [];

          return { section, subgroups };
        });

        if (mounted) setBranches(result);
      } catch (e) {
        const err = e as { message?: string } | undefined;
        if (mounted) setError(err?.message || "No se pudo cargar ramas y subramas.");
      } finally {
        if (mounted) setBranchesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [anio, tenantId, groupSlug]);

  const [exportingBranches, setExportingBranches] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const onExportPDF = async () => {
    try {
      setExportingPDF(true);
      await exportOrgChartCombinedPDF(branches, nivelesData as OrganigramaNiveles, { year: anio });
    } finally {
      setExportingPDF(false);
    }
  };
  const onExportCSVBranches = async () => {
    try {
      setExportingBranches(true);
      await exportBranchesCSV(branches);
    } finally {
      setExportingBranches(false);
    }
  };
  const onExportCSVLevels = () => exportLevelsCSV(nivelesData as OrganigramaNiveles);

  return (
    <div className="min-h-screen bg-background px-6 md:px-8 py-6">
      <header className="flex flex-wrap gap-3 items-center mb-6">
        <h1 className="text-3xl font-extrabold text-primary">Organigrama Completo</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onExportPDF} disabled={exportingPDF} className="bg-primary text-white hover:bg-primary-hover">
            {exportingPDF ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" /> PDF (Completo)
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onExportCSVBranches} disabled={exportingBranches} className="border-border">
            {exportingBranches ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              "CSV Ramas/Subramas"
            )}
          </Button>
          <Button variant="outline" onClick={onExportCSVLevels} className="border-border">
            CSV Niveles
          </Button>
        </div>
      </header>
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={() => navigate("/app/organigrama")}
          variant="outline"
          className="border border-border bg-secondary text-white hover:opacity-90"
        >
          Anterior
        </Button>
      </div>

      {error && (
        <Card className="p-4 border border-destructive text-destructive mb-4">{error}</Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Branches & Subgroups */}
        <Card className="p-4 bg-card border-border border">
          <h2 className="text-xl font-bold text-primary mb-3">Ramas y Subramas</h2>
          {branchesLoading ? (
            <div className="text-sm text-muted-foreground">Cargando ramas…</div>
          ) : (
            <div className="space-y-3">
              {branches.map(({ section, subgroups }: { section: BranchLite; subgroups: SubgroupLite[] }) => (
                <div key={String(section.id)} className="border border-border rounded-md p-3">
                  <div className="font-semibold text-foreground">{section.name}</div>
                  {subgroups.length === 0 ? (
                    <div className="text-sm text-muted-foreground">— Sin subramas</div>
                  ) : (
                    <ul className="list-disc ml-5 mt-2 text-sm">
                      {subgroups.map((sg: SubgroupLite) => (
                        <li key={String(sg.id)} className="text-foreground">
                          {sg.name || "Subrama"}
                          {sg.status ? (
                            <span className="ml-2 text-muted-foreground">({sg.status})</span>
                          ) : null}
                          {sg.leader ? (
                            <span className="ml-2 text-muted-foreground">• Líder: {sg.leader}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Organizational Levels */}
        <Card className="p-4 bg-card border-border border">
          <h2 className="text-xl font-bold text-primary mb-3">Niveles Organizativos</h2>
          {nivelesLoading ? (
            <div className="text-sm text-muted-foreground">Cargando niveles…</div>
          ) : (
            <div className="space-y-3">
              {(nivelesData?.niveles || []).map((nivel) => (
                <div key={nivel.id} className="border border-border rounded-md p-3">
                  <div className="font-semibold text-foreground">{nivel.nombre}</div>
                  {nivel.descripcion && (
                    <div className="text-sm text-muted-foreground">{nivel.descripcion}</div>
                  )}
                  {nivel.cargos.length === 0 ? (
                    <div className="text-sm text-muted-foreground mt-2">— Sin cargos</div>
                  ) : (
                    <ul className="list-disc ml-5 mt-2 text-sm">
                      {nivel.cargos.map((c) => (
                        <li key={c.id} className="text-foreground">
                          {c.nombre}
                          {c.titular ? (
                            <span className="ml-2 text-muted-foreground">• {c.titular}</span>
                          ) : null}
                          {(c.inicio && c.fin) ? (
                            <span className="ml-2 text-muted-foreground">({c.inicio}-{c.fin})</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getSections, getSubgroups } from "@/api/organigramaApi";
import { useNavigate } from "react-router-dom";
import { useNiveles } from "./organigramaNivelesOrganizativos/hooks/useNiveles";
import type { OrganigramaNiveles } from "./organigramaNivelesOrganizativos/types/niveles.types";
import { exportOrgChartCombinedPDF, exportLevelsCSV, exportBranchesCSV } from "./utils/exportOrgChartCombined.ts";

type BranchLite = { id: string | number; name: string; description?: string; minAge?: number; maxAge?: number; status?: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

export default function OrgChartSummary() {
  const currentYear = new Date().getFullYear();
  // Levels (use existing hook; we keep currentYear initial but hide year selector)
  const { anio, data: nivelesData, loading: nivelesLoading } = useNiveles(currentYear);
  const navigate = useNavigate();

  // Branches/Subgroups
  const [branches, setBranches] = useState<Array<{ section: BranchLite; subgroups: SubgroupLite[] }>>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBranchesLoading(true);
        setError(null);
        // Traer secciones crudas y normalizarlas para soportar distintos nombres de campos
        const sectionsRaw = await getSections<any>();
        const normalizeSection = (s: any): BranchLite | null => {
          const id = s?.id ?? s?.sectionId ?? s?.section_id ?? null;
          const name = s?.name ?? s?.nombre ?? "";
          const description = s?.description ?? s?.descripcion ?? undefined;
          const minAge = typeof s?.minAge === 'number' ? s.minAge : (typeof s?.edadMin === 'number' ? s.edadMin : undefined);
          const maxAge = typeof s?.maxAge === 'number' ? s.maxAge : (typeof s?.edadMax === 'number' ? s.edadMax : undefined);
          const status = s?.status ?? s?.estado ?? undefined;
          if (id == null || String(id).trim() === "") return null;
          return { id, name, description, minAge, maxAge, status };
        };
        const normalizeSubgroup = (sg: any): SubgroupLite => {
          return {
            id: sg?.id ?? sg?.subgroup_id ?? sg?.subgroupId ?? crypto.randomUUID(),
            name: sg?.name ?? sg?.subgroupName ?? sg?.nombre ?? sg?.descripcion ?? "",
            status: sg?.status ?? sg?.estado ?? undefined,
            leader: sg?.leader ?? sg?.líder ?? sg?.jefe ?? undefined,
          };
        };

        const normalizedSections: BranchLite[] = (sectionsRaw || [])
          .map(normalizeSection)
          .filter((s: BranchLite | null): s is BranchLite => !!s);

        const result: Array<{ section: BranchLite; subgroups: SubgroupLite[] }> = [];

        for (const sec of normalizedSections) {
          try {
            // Intentar pedir subramas al backend; si falla, caer a []
            const subsRaw = await getSubgroups<any>(sec.id);
            const subs = Array.isArray(subsRaw)
              ? subsRaw.map(normalizeSubgroup)
              : [];
            result.push({ section: sec, subgroups: subs });
          } catch {
            result.push({ section: sec, subgroups: [] });
          }
        }
        if (mounted) setBranches(result);
      } catch (e: any) {
        if (mounted) setError(e?.message || "No se pudo cargar ramas y subramas.");
      } finally {
        if (mounted) setBranchesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [anio]);

  const onExportPDF = () => {
    exportOrgChartCombinedPDF(branches, nivelesData as OrganigramaNiveles, { year: anio });
  };
  const onExportCSVBranches = () => exportBranchesCSV(branches);
  const onExportCSVLevels = () => exportLevelsCSV(nivelesData as OrganigramaNiveles);

  return (
    <div className="min-h-screen bg-background px-6 md:px-8 py-6">
      <header className="flex flex-wrap gap-3 items-center mb-6">
        <h1 className="text-3xl font-extrabold text-primary">Organigrama Completo</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onExportPDF} className="bg-primary text-white hover:bg-primary-hover">
            <Download className="h-4 w-4 mr-2" /> PDF (Completo)
          </Button>
          <Button variant="outline" onClick={onExportCSVBranches} className="border-border">
            CSV Ramas/Subramas
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

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembersAction } from "@/store/members/membersActions";
import type { RootState, AppDispatch } from "@/store/store";
import { useTenantParams } from "./organigramaRamas_Subramas/hooks/useTenantParams";
import { getRamasWithSubramas } from "./organigramaRamas_Subramas/services/rama.service";
import { useNavigate } from "react-router-dom";
import { useNiveles } from "./organigramaNivelesOrganizativos/hooks/useNiveles";
import type { OrganigramaNiveles } from "./organigramaNivelesOrganizativos/types/niveles.types";
import { exportOrgChartCombinedPDF, exportLevelsCSV, exportBranchesCSV } from "./utils/exportOrgChartCombined.ts";

type BranchLite = { id: string | number; name: string; description?: string; minAge?: number; maxAge?: number; status?: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

// Helpers to avoid mixing committees (niveles) inside the branches list
const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isCommitteeName = (name: string) => {
  const n = stripAccents(name).toLowerCase();
  // Tratar estos nombres como niveles organizativos (excluir de Ramas)
  return n.includes("comit") || n.includes("asamblea") || n.includes("corte") || n.includes("consejo");
};
const normalize = (s: string) => stripAccents(String(s || "")).toLowerCase().trim();

// Fixed orders for specific committees
const JEFATURA_ORDER = [
  "Jefe de Región",
  "Sub Jefe de Región",
  "Jefe de Grupo",
  "Sub Jefe de Grupo",
  "Jefe de Rama",
  "Sub Jefe de Subrama",
].map(normalize);

const PADRES_ORDER = [
  "Presidente",
  "Vicepresidente",
  "Secretario",
  "Tesorero",
  "Vocal",
].map(normalize);

export default function OrgChartSummary() {
  const dispatch = useDispatch<AppDispatch>();
  const { members } = useSelector((state: RootState) => state.members);
  
  const currentYear = new Date().getFullYear();
  // Get tenant/group first to use them for both ramas/subramas and niveles
  const { tenantId, groupSlug } = useTenantParams();
  // Pass tenant/group to the niveles hook so it fetches from backend (sections/subgroups)
  const { anio, data: nivelesData, loading: nivelesLoading } = useNiveles(
    currentYear,
    tenantId ? String(tenantId) : undefined,
    groupSlug
  );
  const navigate = useNavigate();

  const [branches, setBranches] = useState<Array<{ section: BranchLite; subgroups: SubgroupLite[] }>>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar miembros al montar el componente
  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersAction());
    }
  }, [dispatch, members.length]);

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

        // Exclude committees from the Ramas/Subramas panel to prevent mixing with niveles
        const onlyRamas = (ramas || []).filter((r) => {
          const rec = r as unknown as Record<string, unknown>;
          const rawName = String(rec['name'] ?? rec['nombre'] ?? '');
          return !isCommitteeName(rawName);
        });

        const result = onlyRamas.map((r) => {
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

  // Asegurar miembros cargados antes de exportar
  const ensureMembersLoaded = async (): Promise<typeof members> => {
    if (members && members.length > 0) return members;
    try {
      const action = await dispatch(fetchMembersAction());
      const payload = (action as unknown as { payload?: unknown }).payload;
      if (Array.isArray(payload)) return payload as typeof members;
    } catch (_) {
      // ignore
    }
    return members;
  };

  const onExportPDF = async () => {
    try {
      setExportingPDF(true);
      const mem = await ensureMembersLoaded();
      await exportOrgChartCombinedPDF(branches, nivelesData as OrganigramaNiveles, mem, { year: anio });
    } finally {
      setExportingPDF(false);
    }
  };
  const onExportCSVBranches = async () => {
    try {
      setExportingBranches(true);
      const mem = await ensureMembersLoaded();
      await exportBranchesCSV(branches, mem);
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
                      {(() => {
                        const nName = normalize(nivel.nombre);
                        const isJefatura = nName.includes("comite de jefatura");
                        const isPadres = nName.includes("comite de padres");
                        const priority = isJefatura ? JEFATURA_ORDER : isPadres ? PADRES_ORDER : null;
                        const sorted = [...nivel.cargos].sort((a, b) => {
                          if (priority) {
                            const ai = priority.indexOf(normalize(a.nombre));
                            const bi = priority.indexOf(normalize(b.nombre));
                            const aIn = ai !== -1;
                            const bIn = bi !== -1;
                            if (aIn && bIn) return ai - bi;
                            if (aIn) return -1;
                            if (bIn) return 1;
                            return a.nombre.localeCompare(b.nombre, "es");
                          }
                          // Default: alphabetical
                          return a.nombre.localeCompare(b.nombre, "es");
                        });
                        return sorted.map((c) => (
                        <li key={c.id} className="text-foreground">
                          {c.nombre}
                          {c.titular ? (
                            <span className="ml-2 text-muted-foreground">• {c.titular}</span>
                          ) : null}
                          {(c.inicio && c.fin) ? (
                            <span className="ml-2 text-muted-foreground">({c.inicio}-{c.fin})</span>
                          ) : null}
                        </li>
                        ));
                      })()}
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
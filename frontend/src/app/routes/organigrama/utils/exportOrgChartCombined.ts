import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";
import type { Member } from "@/types/member.type";

type BranchLite = {
  id: string | number;
  name: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
  status?: string;
};
type SubgroupLite = {
  id: string | number;
  name?: string;
  status?: string;
  leader?: string;
};

type SimpleBranches = Array<{ section: BranchLite; subgroups: SubgroupLite[] }>;

function download(
  filename: string,
  content: string,
  type = "text/csv;charset=utf-8;"
) {
  const blob = new Blob(["\uFEFF" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Helpers para resolver IDs de subgrupo desde diferentes formatos
function toNumberSafe(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v).trim();
  if (s.length === 0) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function getMemberSubgroupId(member: Member): number | undefined {
  const direct = member.subgroup_id;
  const nested = member.subgroup?.subgroup_id ?? member.subgroup?.subgroupId;
  return toNumberSafe(direct ?? nested);
}

// Business rules aligned with RamaDetail view
function isMemberActiveAndApproved(member: Member): boolean {
  const isActive = member.is_active ?? member.isActive;
  const status = member.status;
  const active = typeof isActive === "boolean" ? isActive : true;
  return active && status === "APPROVED";
}

function isMemberScouter(member: Member): boolean {
  return member.role === "SCOUTER";
}

function fullName(member: Member): string {
  const fn = member.firstName ?? member.first_name ?? "";
  const ln = member.lastName ?? member.last_name ?? "";
  return `${String(fn).trim()} ${String(ln).trim()}`.trim();
}

export async function exportBranchesCSV(
  branches: SimpleBranches,
  members: Member[] = []
) {
  const header = [
    "Rama",
    "Descripción",
    "NombreSubrama",
    "Integrantes",
    "JefeRama",
  ];
  const rows: string[][] = [];

  for (const { section, subgroups } of branches) {
    // Nota: el jefe de rama se calculará por subrama a partir de los miembros (rol SCOUTER)
    const jefeRama = ""; // a nivel de fila de rama sin subramas no es determinable
    const desc =
      section.description && String(section.description).trim()
        ? String(section.description)
        : typeof section.minAge === "number" &&
          typeof section.maxAge === "number" &&
          section.minAge > 0 &&
          section.maxAge > 0
        ? `${section.minAge}-${section.maxAge} años`
        : "—";

    if (!subgroups || subgroups.length === 0) {
      rows.push([section.name, desc, "— (Sin subramas)", "", jefeRama || ""]);
    } else {
      for (const sg of subgroups) {
        const nameFull = sg.name || "Subrama";

        // Obtener miembros de la subrama
        let integrantes = "";
        let jefeNames = "";
        try {
          const subgroupId = sg.id;
          if (subgroupId && members.length > 0) {
            // Filtrar miembros que pertenecen a este subgrupo
            const sgNum = toNumberSafe(subgroupId);
            const subgroupMembers = members.filter((member) => {
              const mSgId = getMemberSubgroupId(member);
              return mSgId !== undefined && sgNum !== undefined && mSgId === sgNum;
            });

            if (subgroupMembers.length > 0) {
              const activos = subgroupMembers.filter(isMemberActiveAndApproved);
              const jefes = activos.filter(isMemberScouter);
              const scouts = activos.filter((m) => !isMemberScouter(m));

              jefeNames = jefes.map(fullName).filter(Boolean).join(", ");
              integrantes = scouts.map(fullName).filter(Boolean).join(", ");
            }
          }
        } catch (error) {
          console.warn(
            " [Export CSV OrgChart] Error procesando miembros para subrama:",
            sg.name ?? sg.id,
            error
          );
          // Fallback vacío
        }

        // Usar los jefes calculados; si no hay datos, intentar respaldarse con sg.leader
        rows.push([section.name, desc, nameFull, integrantes, jefeNames || sg.leader || ""]);
      }
    }
  }

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download("organigrama_ramas.csv", csv);
}

export function exportLevelsCSV(data: OrganigramaNiveles) {
  const header = ["Nivel", "Cargo", "Titular", "Periodo", "Descripción"];
  const rows: string[][] = [];
  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = (s: string) =>
    stripAccents(String(s || ""))
      .toLowerCase()
      .trim();
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
  data.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      rows.push([
        nivel.nombre,
        "—",
        "—",
        String(data.anio ?? "—"),
        nivel.descripcion || "—",
      ]);
    } else {
      const nName = normalize(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER : isPad ? PADRES_ORDER : null;
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
        return a.nombre.localeCompare(b.nombre, "es");
      });
      sorted.forEach((c) => {
        const periodo = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        rows.push([
          nivel.nombre,
          c.nombre,
          c.titular || "—",
          periodo,
          c.descripcion || "—",
        ]);
      });
    }
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download(`organigrama_niveles_${data.anio}.csv`, csv);
}

export async function exportOrgChartCombinedPDF(
  branches: SimpleBranches,
  levels: OrganigramaNiveles,
  members: Member[] = [],
  opts?: { year?: number; groupName?: string }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const x = 40;
  let y = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 65, 52);
  const titleBase = `Estructura de Ramas, Subramas y Niveles Organizativos`;
  const normalize = (s?: string) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const hasGrupoScoutPrefix = (name?: string) => normalize(name).startsWith("grupo scout");
  const groupDisplay = opts?.groupName
    ? hasGrupoScoutPrefix(opts.groupName)
      ? opts.groupName
      : `Grupo Scout ${opts.groupName}`
    : "";
  // Nota: Se omite el año en el título según solicitud
  const title = `${titleBase}${groupDisplay ? ` - ${groupDisplay}` : ""}`;
  doc.text(title, x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, x, y + 16);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Ramas y Subramas", x, y);

  const branchesBody: string[][] = [];
  for (const { section, subgroups } of branches) {
    // Igual que en CSV, los jefes se calculan por subrama usando los miembros
    const jefeRama = "";
    const desc =
      section.description && String(section.description).trim()
        ? String(section.description)
        : typeof section.minAge === "number" &&
          typeof section.maxAge === "number" &&
          section.minAge > 0 &&
          section.maxAge > 0
        ? `${section.minAge}-${section.maxAge} años`
        : "—";
    if (!subgroups || subgroups.length === 0) {
      branchesBody.push([
        section.name,
        desc,
        "— (Sin subramas)",
        "",
        jefeRama || "",
      ]);
    } else {
      for (const sg of subgroups) {
        const nameFull = sg.name || "Subrama";

        // Obtener miembros de la subrama
        let integrantes = "";
        let jefeNames = "";
        try {
          const subgroupId = sg.id;
          if (subgroupId && members.length > 0) {
            // Filtrar miembros que pertenecen a este subgrupo
            const sgNum = toNumberSafe(subgroupId);
            const subgroupMembers = members.filter((member) => {
              const mSgId = getMemberSubgroupId(member);
              return mSgId !== undefined && sgNum !== undefined && mSgId === sgNum;
            });

            if (subgroupMembers.length > 0) {
              const activos = subgroupMembers.filter(isMemberActiveAndApproved);
              const jefes = activos.filter(isMemberScouter);
              const scouts = activos.filter((m) => !isMemberScouter(m));

              jefeNames = jefes.map(fullName).filter(Boolean).join(", ");
              integrantes = scouts.map(fullName).filter(Boolean).join(", ");
            }
          }
        } catch (error) {
          console.warn(
            " [Export PDF OrgChart] Error procesando miembros para subrama:",
            sg.name ?? sg.id,
            error
          );
          // Fallback vacío
        }

        branchesBody.push([
          section.name,
          desc,
          nameFull,
          integrantes,
          jefeNames || sg.leader || "",
        ]);
      }
    }
  }

  autoTable(doc, {
    startY: y + 10,
    head: [["Rama", "Descripción", "NombreSubrama", "Integrantes", "JefeRama"]],
    body: branchesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  const anyDoc = doc as unknown as { lastAutoTable?: { finalY: number } };
  if (anyDoc.lastAutoTable?.finalY) {
    y = anyDoc.lastAutoTable.finalY + 30;
  } else {
    y += 200;
  }

  // Levels section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Niveles Organizativos", x, y);

  const levelsBody: (string | number)[][] = [];
  const stripAccents2 = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize2 = (s: string) =>
    stripAccents2(String(s || ""))
      .toLowerCase()
      .trim();
  const JEFATURA_ORDER2 = [
    "Jefe de Región",
    "Sub Jefe de Región",
    "Jefe de Grupo",
    "Sub Jefe de Grupo",
    "Jefe de Rama",
    "Sub Jefe de Subrama",
  ].map(normalize2);
  const PADRES_ORDER2 = [
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Vocal",
  ].map(normalize2);
  levels.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      levelsBody.push([nivel.nombre, "—", "—", "—", nivel.descripcion || "—"]);
    } else {
      const nName = normalize2(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER2 : isPad ? PADRES_ORDER2 : null;
      const sorted = [...nivel.cargos].sort((a, b) => {
        if (priority) {
          const ai = priority.indexOf(normalize2(a.nombre));
          const bi = priority.indexOf(normalize2(b.nombre));
          const aIn = ai !== -1;
          const bIn = bi !== -1;
          if (aIn && bIn) return ai - bi;
          if (aIn) return -1;
          if (bIn) return 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }
        return a.nombre.localeCompare(b.nombre, "es");
      });
      sorted.forEach((c) => {
        const period = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        levelsBody.push([
          nivel.nombre,
          c.nombre,
          c.titular || "—",
          period,
          c.descripcion || "—",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Nivel", "Cargo", "Titular", "Periodo", "Descripción"]],
    body: levelsBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  doc.save(`organigrama_completo_${opts?.year ?? ""}.pdf`);
}

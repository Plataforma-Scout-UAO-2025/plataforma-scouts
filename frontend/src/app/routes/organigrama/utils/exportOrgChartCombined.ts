import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";
import type { Member } from "@/types/member.type";
import KNUT from "@/assets/KNUT.png";

// Image loader to compute footer size
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

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
  // Filtra para incluir solo las 5 ramas canónicas (Cachorros, Manada, Webelos, Tropa, Clan)
  const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = (s?: string) => stripAccents(String(s ?? "")).toLowerCase().trim();
  const TOKENS = ["cachorros", "manada", "webelos", "tropa", "clan"] as const;
  type Cat = typeof TOKENS[number];
  const byCat: Record<Cat, SimpleBranches> = {
    cachorros: [],
    manada: [],
    webelos: [],
    tropa: [],
    clan: [],
  };
  for (const b of branches) {
    const n = normalize(b.section?.name);
    const cat = TOKENS.find((t) => n.startsWith(t)) as Cat | undefined;
    if (cat) byCat[cat].push(b);
  }
  const pickCanonical = (list: SimpleBranches, token: Cat) => {
    if (!list || list.length === 0) return undefined;
    const exact = list.find((b) => normalize(b.section?.name) === token);
    return exact ?? list[0];
  };
  const filtered: SimpleBranches = [];
  for (const t of TOKENS) {
    const chosen = pickCanonical(byCat[t], t);
    if (chosen) filtered.push(chosen);
  }
  const header = [
    "Rama",
    "Descripción",
    "NombreSubrama",
    "Integrantes",
    "JefeRama",
  ];
  const rows: string[][] = [];

  for (const { section, subgroups } of filtered) {
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

export function exportLevelsCSV(data: OrganigramaNiveles, members: Member[] = []) {
  const header = ["Nivel", "Cargo", "Titular", "Descripción"];
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
        nivel.descripcion || "—",
      ]);
    } else {
      const nName = normalize(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER : isPad ? PADRES_ORDER : null;
      const sorted = [...nivel.cargos].sort((a, b) => {
        const SIN = "sin cargo";
        const an = normalize(a.nombre);
        const bn = normalize(b.nombre);
        if (priority) {
          if (an === SIN && bn === SIN) return 0;
          if (an === SIN) return 1;
          if (bn === SIN) return -1;
          const ai = priority.indexOf(an);
          const bi = priority.indexOf(bn);
          const aIn = ai !== -1;
          const bIn = bi !== -1;
          if (aIn && bIn) return ai - bi;
          if (aIn) return -1;
          if (bIn) return 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }
        if (an === SIN && bn === SIN) return 0;
        if (an === SIN) return 1;
        if (bn === SIN) return -1;
        return a.nombre.localeCompare(b.nombre, "es");
      });
      sorted.forEach((c) => {
        // Calcular titulares a partir de miembros vinculados al cargo (subgrupo)
        let titulares = c.titular || "";
        const cargoIdNum = toNumberSafe((c as unknown as { id?: unknown }).id);
        if (cargoIdNum !== undefined && members && members.length > 0) {
          const assigned = members.filter((m) => getMemberSubgroupId(m) === cargoIdNum);
          const names = assigned.map((m) => {
            const name = m.firstName ?? m.first_name ?? "";
            const last = m.lastName ?? m.last_name ?? "";
            const display = `${String(name).trim()} ${String(last).trim()}`.trim();
            return display.length > 0 ? display : "Miembro";
          });
          if (names.length > 0) titulares = names.join(", ");
        }
        rows.push([
          nivel.nombre,
          c.nombre,
          titulares || "—",
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
  // Pre-calc footer dimensions for bottom margin reservation
  const pageWidth0 = doc.internal.pageSize.getWidth();
  const footerW = Math.min(140, pageWidth0 * 0.18);
  let footerH = 56;
  let footerImg: HTMLImageElement | undefined;
  try {
    footerImg = await loadImage(KNUT);
    const ratio = footerImg.height > 0 ? footerImg.height / footerImg.width : 0.4;
    footerH = footerW * ratio;
  } catch { /* keep defaults */ }

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
  // Mismo filtrado canónico para el PDF combinado
  const stripAccentsB = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizeB = (s?: string) => stripAccentsB(String(s ?? "")).toLowerCase().trim();
  const TOKENSB = ["cachorros", "manada", "webelos", "tropa", "clan"] as const;
  type CatB = typeof TOKENSB[number];
  const byCatB: Record<CatB, SimpleBranches> = { cachorros: [], manada: [], webelos: [], tropa: [], clan: [] };
  for (const b of branches) {
    const n = normalizeB(b.section?.name);
    const cat = TOKENSB.find((t) => n.startsWith(t)) as CatB | undefined;
    if (cat) byCatB[cat].push(b);
  }
  const pickCanonicalB = (list: SimpleBranches, token: CatB) => {
    if (!list || list.length === 0) return undefined;
    const exact = list.find((b) => normalizeB(b.section?.name) === token);
    return exact ?? list[0];
  };
  const filteredBranches: SimpleBranches = [];
  for (const t of TOKENSB) {
    const chosen = pickCanonicalB(byCatB[t], t);
    if (chosen) filteredBranches.push(chosen);
  }
  for (const { section, subgroups } of filteredBranches) {
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
    margin: { left: x, right: x, bottom: Math.ceil(footerH + 24) },
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
      levelsBody.push([nivel.nombre, "—", "—", nivel.descripcion || "—"]);
    } else {
      const nName = normalize2(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER2 : isPad ? PADRES_ORDER2 : null;
      const sorted = [...nivel.cargos].sort((a, b) => {
        const SIN = "sin cargo";
        const an = normalize2(a.nombre);
        const bn = normalize2(b.nombre);
        if (priority) {
          if (an === SIN && bn === SIN) return 0;
          if (an === SIN) return 1;
          if (bn === SIN) return -1;
          const ai = priority.indexOf(an);
          const bi = priority.indexOf(bn);
          const aIn = ai !== -1;
          const bIn = bi !== -1;
          if (aIn && bIn) return ai - bi;
          if (aIn) return -1;
          if (bIn) return 1;
          return a.nombre.localeCompare(b.nombre, "es");
        }
        if (an === SIN && bn === SIN) return 0;
        if (an === SIN) return 1;
        if (bn === SIN) return -1;
        return a.nombre.localeCompare(b.nombre, "es");
      });
      sorted.forEach((c) => {
        // Calcular titulares desde miembros asignados al cargo (mostrar TODOS los miembros asignados)
        let titulares = c.titular || "";
        const cargoIdNum = toNumberSafe((c as unknown as { id?: unknown }).id);
        if (cargoIdNum !== undefined && members && members.length > 0) {
          const assigned = members.filter((m) => getMemberSubgroupId(m) === cargoIdNum);
          const names = assigned.map((m) => fullName(m)).filter(Boolean);
          if (names.length > 0) titulares = names.join(", ");
        }
        levelsBody.push([
          nivel.nombre,
          c.nombre,
          titulares || "—",
          c.descripcion || "—",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Nivel", "Cargo", "Titular", "Descripción"]],
    body: levelsBody,
    margin: { left: x, right: x, bottom: Math.ceil(footerH + 24) },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  // Pie de página con imagen KNUT en todas las páginas
  try {
    const img = footerImg ?? await loadImage(KNUT);
    const pageCount: number = (doc as unknown as { getNumberOfPages?: () => number; internal?: { getNumberOfPages?: () => number } }).getNumberOfPages?.() ?? (doc as unknown as { internal?: { getNumberOfPages?: () => number } }).internal?.getNumberOfPages?.() ?? 1;
    // Solo en la última página
    const last = Math.max(1, pageCount);
    doc.setPage(last);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const w = Math.min(footerW, pageWidth * 0.18);
    const ratio = img.height > 0 ? img.height / img.width : footerH / Math.max(footerW, 1);
    const h = w * ratio;
    const xImg = (pageWidth - w) / 2;
    const yImg = pageHeight - h - margin;
    (doc as unknown as { addImage: (imageData: HTMLImageElement | string, format: string, x: number, y: number, w: number, h: number, alias?: string, compression?: "NONE" | "FAST" | "SLOW") => jsPDF }).addImage(img, "PNG", xImg, yImg, w, h, undefined, "FAST");
  } catch (e) {
    console.warn("[Export PDF OrgChart] No se pudo cargar la imagen de pie de página KNUT:", e);
  }

  doc.save(`organigrama_completo_${opts?.year ?? ""}.pdf`);
}

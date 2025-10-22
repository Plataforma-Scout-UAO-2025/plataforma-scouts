import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";
import type { Member } from "@/types/member.type";
import { getMembersBySubgroup } from "@/api/organigramaApi";

// Helpers to safely read possible camelCase/snake_case name fields without using `any`
const getFirstName = (obj: unknown): string => {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  return typeof o.firstName === "string"
    ? o.firstName
    : typeof o.first_name === "string"
    ? o.first_name
    : "";
};
const getLastName = (obj: unknown): string => {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  return typeof o.lastName === "string"
    ? o.lastName
    : typeof o.last_name === "string"
    ? o.last_name
    : "";
};

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
    const uniqueLeaders = Array.from(
      new Set(
        (subgroups || []).map((sg) => sg.leader).filter(Boolean) as string[]
      )
    );
    const jefeRama = uniqueLeaders.join(", ");
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
        try {
          const subgroupId = sg.id;
          if (subgroupId && members.length > 0) {
            // Filtrar miembros que pertenecen a este subgrupo
            const subgroupMembers = members.filter(
              (member) => member.subgroup_id === Number(subgroupId)
            );

            if (subgroupMembers.length > 0) {
              integrantes = subgroupMembers
                .map((m) => `${getFirstName(m)} ${getLastName(m)}`.trim())
                .filter(Boolean)
                .join(", ");
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

        rows.push([section.name, desc, nameFull, integrantes, jefeRama || ""]);
      }
    }
  }

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download("organigrama_ramas.csv", csv);
}

export async function exportLevelsCSV(data: OrganigramaNiveles, members: Member[] = []) {
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
  for (const nivel of data.niveles) {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      rows.push([nivel.nombre, "—", "—", String(data.anio ?? "—"), nivel.descripcion || "—"]);
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

      for (const c of sorted) {
        const periodo = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        let titulares = c.titular || "";
        try {
          const cargoId = Number(c.id);
          if (!Number.isNaN(cargoId)) {
            let subgroupMembers: Member[] = [];
            if (members && members.length > 0) {
              subgroupMembers = members.filter((m) => m.subgroup_id === cargoId);
            }
            if (subgroupMembers.length === 0) {
              try {
                const fetched = await getMembersBySubgroup(cargoId);
                subgroupMembers = (fetched as unknown as Member[]) || [];
              } catch (error) {
                console.warn("[Export Levels CSV] No se pudieron cargar miembros para cargo", cargoId, error);
              }
            }
            if (subgroupMembers.length > 0) {
              titulares = subgroupMembers
                .map((m) => `${getFirstName(m)} ${getLastName(m)}`.trim())
                .filter(Boolean)
                .join(", ");
            }
          }
        } catch (error) {
          console.warn("[Export Levels CSV] Error procesando cargo", c.id, error);
        }

        rows.push([
          nivel.nombre,
          c.nombre,
          titulares || "—",
          periodo,
          c.descripcion || "—",
        ]);
      }
    }
  }

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download(`organigrama_niveles_${data.anio}.csv`, csv);
}

export async function exportOrgChartCombinedPDF(
  branches: SimpleBranches,
  levels: OrganigramaNiveles,
  members: Member[] = [],
  opts?: { year?: number }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const x = 40;
  let y = 50;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 65, 52);
  const title = `Organigrama Completo${opts?.year ? ` – ${opts.year}` : ""}`;
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
    const uniqueLeaders = Array.from(
      new Set(
        (subgroups || []).map((s) => s.leader).filter(Boolean) as string[]
      )
    );
    const jefeRama = uniqueLeaders.join(", ");
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
        try {
          const subgroupId = sg.id;
          if (subgroupId) {
            // 1) Intentar con los miembros ya cargados si existen
            let subgroupMembers: Member[] = [];
            if (members && members.length > 0) {
              subgroupMembers = members.filter(
                (m) => m.subgroup_id === Number(subgroupId)
              );
            }
            // 2) Si no hay miembros en cache, intentar obtenerlos del backend
            if (subgroupMembers.length === 0) {
              try {
                const fetched = await getMembersBySubgroup(Number(subgroupId));
                subgroupMembers = (fetched as unknown as Member[]) || [];
              } catch {
                // continuar silenciosamente; dejaremos integrantes vacío
              }
            }
            if (subgroupMembers.length > 0) {
              integrantes = subgroupMembers
                .map((m) => `${getFirstName(m)} ${getLastName(m)}`.trim())
                .filter(Boolean)
                .join(", ");
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
          jefeRama || "",
        ]);
      }
    }
  }

  // Ajuste de anchos dinámico para evitar corte de tabla
  const pageW = doc.internal.pageSize.getWidth();
  const availableW = pageW - x * 2;
  const weights = [14, 14, 22, 38, 12]; // Rama, Descripción, NombreSubrama, Integrantes, JefeRama
  const totalW = weights.reduce((a, b) => a + b, 0);
  const colW = weights.map((w) => Math.floor((w / totalW) * availableW));
  const columnStyles: Record<string, { cellWidth: number }> = {};
  colW.forEach((w, i) => (columnStyles[i] = { cellWidth: w }));

  autoTable(doc, {
    startY: y + 10,
    head: [["Rama", "Descripción", "NombreSubrama", "Integrantes", "JefeRama"]],
    body: branchesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
    columnStyles,
    bodyStyles: { valign: 'top' },
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
  for (const nivel of levels.niveles) {
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

      for (const c of sorted) {
        const period = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        let titulares = c.titular || "";
        try {
          const cargoId = Number(c.id);
          if (!Number.isNaN(cargoId)) {
            let subgroupMembers: Member[] = [];
            if (members && members.length > 0) {
              subgroupMembers = members.filter((m) => m.subgroup_id === cargoId);
            }
            if (subgroupMembers.length === 0) {
              try {
                const fetched = await getMembersBySubgroup(cargoId);
                subgroupMembers = (fetched as unknown as Member[]) || [];
              } catch (error) {
                console.warn("[Export PDF Levels] No se pudieron cargar miembros para cargo", cargoId, error);
              }
            }
            if (subgroupMembers.length > 0) {
              titulares = subgroupMembers
                .map((m) => `${getFirstName(m)} ${getLastName(m)}`.trim())
                .filter(Boolean)
                .join(", ");
            }
          }
        } catch (error) {
          console.warn("[Export PDF Levels] Error procesando cargo", c.id, error);
        }

        levelsBody.push([
          nivel.nombre,
          c.nombre,
          titulares || "—",
          period,
          c.descripcion || "—",
        ]);
      }
    }
  }

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

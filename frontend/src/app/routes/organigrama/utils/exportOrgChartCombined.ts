import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";
import { getMembersBySubgroup } from "@/api/organigramaApi";
import type { Member } from "@/types/member.type";

type BranchLite = { id: string | number; name: string; description?: string; minAge?: number; maxAge?: number; status?: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

type SimpleBranches = Array<{ section: BranchLite; subgroups: SubgroupLite[] }>;

function download(filename: string, content: string, type = "text/csv;charset=utf-8;") {
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

export async function exportBranchesCSV(branches: SimpleBranches) {
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
      new Set((subgroups || []).map((sg) => sg.leader).filter(Boolean) as string[])
    );
    const jefeRama = uniqueLeaders.join(", ");
    const desc = (section.description && String(section.description).trim())
      ? String(section.description)
      : (typeof section.minAge === 'number' && typeof section.maxAge === 'number' && section.minAge > 0 && section.maxAge > 0
          ? `${section.minAge}-${section.maxAge} años`
          : '—');

    if (!subgroups || subgroups.length === 0) {
      rows.push([
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
        let integrantes = '';
        try {
          const subgroupId = sg.id;
          if (subgroupId) {
            const members = await getMembersBySubgroup(Number(subgroupId));
            if (members && members.length > 0) {
              integrantes = members.map((m: Record<string, unknown>) => {
                const firstName = m.firstName ?? m.first_name ?? '';
                const lastName = m.lastName ?? m.last_name ?? '';
                return `${firstName} ${lastName}`.trim();
              }).filter(Boolean).join(', ');
            }
          }
        } catch (error) {
          console.warn(' [Export CSV OrgChart] Error obteniendo miembros para subrama:', sg.name ?? sg.id, error);
          // Fallback vacío
        }

        rows.push([
          section.name,
          desc,
          nameFull,
          integrantes,
          jefeRama || "",
        ]);
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
  data.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      rows.push([nivel.nombre, "—", "—", String(data.anio ?? "—"), nivel.descripcion || "—"]);
    } else {
      nivel.cargos.forEach((c) => {
        const periodo = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        rows.push([nivel.nombre, c.nombre, c.titular || "—", periodo, c.descripcion || "—"]);
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
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, x, y + 16);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Ramas y Subramas", x, y);

  const branchesBody: string[][] = [];
  for (const { section, subgroups } of branches) {
    const uniqueLeaders = Array.from(new Set((subgroups || []).map((s) => s.leader).filter(Boolean) as string[]));
    const jefeRama = uniqueLeaders.join(", ");
    const desc = (section.description && String(section.description).trim())
      ? String(section.description)
      : (typeof section.minAge === 'number' && typeof section.maxAge === 'number' && section.minAge > 0 && section.maxAge > 0
          ? `${section.minAge}-${section.maxAge} años`
          : '—');
    if (!subgroups || subgroups.length === 0) {
      branchesBody.push([
        section.name,
        desc,
        '— (Sin subramas)',
        '',
        jefeRama || "",
      ]);
    } else {
      for (const sg of subgroups) {
        const nameFull = sg.name || "Subrama";

        // Obtener miembros de la subrama
        let integrantes = '';
        try {
          const subgroupId = sg.id;
          if (subgroupId) {
            const members = await getMembersBySubgroup(Number(subgroupId));
            if (members && members.length > 0) {
              integrantes = members.map((m: Member) => {
                const firstName = m.first_name ?? '';
                const lastName = m.last_name ?? '';
                return `${firstName} ${lastName}`.trim();
              }).filter(Boolean).join(', ');
            }
          }
        } catch (error) {
          console.warn(' [Export PDF OrgChart] Error obteniendo miembros para subrama:', sg.name ?? sg.id, error);
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

  autoTable(doc, {
    startY: y + 10,
    head: [["Rama", "Descripción", "NombreSubrama", "Integrantes", "JefeRama"]],
    body: branchesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 200 }, // Rama
      1: { cellWidth: 230 }, // Descripción 
      2: { cellWidth: 200 }, // NombreSubrama
      3: { cellWidth: 200 }, // Integrantes
      4: { cellWidth: 200 }, // JefeRama
    },
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
  levels.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      levelsBody.push([nivel.nombre, "—", "—", "—", nivel.descripcion || "—"]);
    } else {
      nivel.cargos.forEach((c) => {
        const period = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        levelsBody.push([nivel.nombre, c.nombre, c.titular || "—", period, c.descripcion || "—"]);
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
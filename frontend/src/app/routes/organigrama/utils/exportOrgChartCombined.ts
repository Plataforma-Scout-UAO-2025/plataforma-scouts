import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";

type BranchLite = { id: string | number; name: string };
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

export function exportBranchesCSV(branches: SimpleBranches) {
  const header = ["Branch", "Subgroup", "Status", "Leader"];
  const rows: string[][] = [];

  branches.forEach(({ section, subgroups }) => {
    if (!subgroups || subgroups.length === 0) {
      rows.push([section.name, "— (No subgroups)", "—", "—"]);
    } else {
      subgroups.forEach((sg) => {
        rows.push([
          section.name,
          sg.name || "Subgroup",
          sg.status || "—",
          sg.leader || "—",
        ]);
      });
    }
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download("orgchart_branches.csv", csv);
}

export function exportLevelsCSV(data: OrganigramaNiveles) {
  const header = ["Level", "Position", "Holder", "Period", "Description"];
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
  download(`orgchart_levels_${data.anio}.csv`, csv);
}

export function exportOrgChartCombinedPDF(
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
  const title = `Complete Org Chart${opts?.year ? ` – ${opts.year}` : ""}`;
  doc.text(title, x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated: ${new Date().toLocaleString()}`, x, y + 16);

  // Branches/Subgroups section
  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Branches & Subgroups", x, y);

  const branchesBody: string[][] = [];
  branches.forEach(({ section, subgroups }) => {
    if (!subgroups || subgroups.length === 0) {
      branchesBody.push([section.name, "— (No subgroups)", "—", "—"]);
    } else {
      subgroups.forEach((sg) => {
        branchesBody.push([
          section.name,
          sg.name || "Subgroup",
          sg.status || "—",
          sg.leader || "—",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Branch", "Subgroup", "Status", "Leader"]],
    body: branchesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  // Position after first table
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
  doc.text("Organizational Levels", x, y);

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
    head: [["Level", "Position", "Holder", "Period", "Description"]],
    body: levelsBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  doc.save(`orgchart_combined_${opts?.year ?? ""}.pdf`);
}

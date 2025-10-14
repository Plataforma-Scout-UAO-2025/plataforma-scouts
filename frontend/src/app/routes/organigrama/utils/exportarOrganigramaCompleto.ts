import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrganigramaNiveles } from "../organigramaNivelesOrganizativos/types/niveles.types";

type BranchLite = { id: string | number; name: string };
type SubgroupLite = { id: string | number; name?: string; status?: string; leader?: string };

type RamasSimple = Array<{ section: BranchLite; subgroups: SubgroupLite[] }>;

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

export function exportarCSVRamas(ramas: RamasSimple) {
  const header = ["Rama", "Subrama", "Líder"];
  const rows: string[][] = [];

  ramas.forEach(({ section, subgroups }) => {
    if (!subgroups || subgroups.length === 0) {
      rows.push([section.name, "— (Sin subramas)", "—"]);
    } else {
      subgroups.forEach((sg) => {
        rows.push([
          section.name,
          sg.name || "Subrama",
          sg.leader || "—",
        ]);
      });
    }
  });

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  download("organigrama_ramas.csv", csv);
}

export function exportarCSVNiveles(data: OrganigramaNiveles) {
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

export function exportarOrganigramaCompletoPDF(
  ramas: RamasSimple,
  niveles: OrganigramaNiveles,
  opts?: { anio?: number }
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const x = 40;
  let y = 50;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(26, 65, 52); // #1A4134
  const titulo = `Organigrama Completo${opts?.anio ? ` – ${opts.anio}` : ""}`;
  doc.text(titulo, x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generado: ${new Date().toLocaleString()}`, x, y + 16);

  // Sección Ramas/Subramas
  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Ramas y Subramas", x, y);

  const ramasBody: string[][] = [];
  ramas.forEach(({ section, subgroups }) => {
    if (!subgroups || subgroups.length === 0) {
      ramasBody.push([section.name, "— (Sin subramas)", "—"]);
    } else {
      subgroups.forEach((sg) => {
        ramasBody.push([
          section.name,
          sg.name || "Subrama",
          sg.leader || "—",
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Rama", "Subrama", "Líder"]],
    body: ramasBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 150 }, // Rama
      1: { cellWidth: 350 }, // Subrama (más ancho)
      2: { cellWidth: 150 }, // Líder
    },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  // Saltar a continuación de la tabla anterior
  const anyDoc = doc as unknown as { lastAutoTable?: { finalY: number } };
  if (anyDoc.lastAutoTable?.finalY) {
    y = anyDoc.lastAutoTable.finalY + 30;
  } else {
    y += 200;
  }

  // Sección Niveles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 65, 52);
  doc.text("Niveles Organizativos", x, y);

  const nivelesBody: (string | number)[][] = [];
  niveles.niveles.forEach((nivel) => {
    if (!nivel.cargos || nivel.cargos.length === 0) {
      nivelesBody.push([nivel.nombre, "—", "—", "—", nivel.descripcion || "—"]);
    } else {
      nivel.cargos.forEach((c) => {
        const periodo = c.inicio && c.fin ? `${c.inicio}-${c.fin}` : "—";
        nivelesBody.push([nivel.nombre, c.nombre, c.titular || "—", periodo, c.descripcion || "—"]);
      });
    }
  });

  autoTable(doc, {
    startY: y + 10,
    head: [["Nivel", "Cargo", "Titular", "Periodo", "Descripción"]],
    body: nivelesBody,
    margin: { left: x, right: x },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [26, 65, 52], textColor: [255, 255, 255] },
  });

  doc.save(`organigrama_completo_${opts?.anio ?? ""}.pdf`);
}

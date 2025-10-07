import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";

type ExportPDFOpts = {
  anio?: number;
  /** Hex para el color de marca. Ej: "#1A4134" */
  colorHex?: string;
};

/** Descarga nativa sin file-saver */
function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** #RRGGBB -> [r,g,b] */
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [26, 65, 52]; // fallback #1A4134
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Construye filas Rama→Subrama sin undefined (siempre 3 columnas) */
function construirFilas(ramas: Rama[]): string[][] {
  const filas: string[][] = [];
  for (const r of ramas) {
    const displayName = r.name ?? r.nombre ?? '';
    const displayEstado = (r.status === 'active' ? 'activa' : (r.status === 'inactive' ? 'inactiva' : r.estado ?? ''));
    filas.push([`Rama: ${displayName}`, "", `Estado: ${displayEstado}`]);
    if (r.subramas && r.subramas.length > 0) {
      for (const s of r.subramas) {
        const sName = s.name ?? s.nombre ?? '';
        const sEstado = (s.status === 'active' ? 'activa' : (s.status === 'inactive' ? 'inactiva' : s.estado ?? ''));
        filas.push([
          "",
          `Subrama: ${sName}`,
          `Estado: ${sEstado}`,
        ]);
      }
    } else {
      filas.push(["", "— (Sin subramas)", ""]);
    }
  }
  return filas;
}

/** Exporta PDF manteniendo jerarquía Rama→Subrama */
export const exportarOrganigramaPDF = (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const x = 40;
    const y = 50;

    const [r, g, b] = hexToRgb(opts.colorHex ?? "#1A4134");

    // TÍTULO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(r, g, b);
    const titulo = "Organigrama Scout" + (opts.anio ? ` – ${opts.anio}` : "");
    doc.text(titulo, x, y);

    // Subtítulo (fecha)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generado: ${new Date().toLocaleString()}`, x, y + 16);

  const body = construirFilas(ramas); // string[][] sin undefined

    autoTable(doc, {
      startY: y + 32,
      head: [["Rama", "Subrama", "Estado"]],
      body,
      styles: { fontSize: 10, cellPadding: 6, overflow: "linebreak" },
      // ENCABEZADO en #1A4134 con texto blanco
      headStyles: { fillColor: [r, g, b], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 260 }, 2: { cellWidth: 100 } },
      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 0 &&
          typeof data.cell.text?.[0] === "string" &&
          data.cell.text[0].startsWith("Rama:")
        ) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save("organigrama.pdf");
  } catch (e) {
    console.error("❌ Error exportando PDF:", e);
  }
};

/** Exporta CSV con estructura Rama→Subrama (separador ';' para Excel en español) */
export const exportarOrganigramaCSV = (ramas: Rama[]) => {
  try {
<<<<<<< HEAD
    const hojaRamas = ramas.map((r) => ({
      Rama: (r.name ?? r.nombre) as string,
      Estado: (r.status === 'active' ? 'activa' : (r.status === 'inactive' ? 'inactiva' : r.estado ?? '')),
      "Descripción Rama": r.description ?? "",
      "Edad mínima": r.minAge ?? "",
      "Edad máxima": r.maxAge ?? "",
      "Año": r.year ?? "",
      "Total subramas": r.subgroups?.length ?? r.subramas?.length ?? 0,
      "ID Rama": r.id,
      "Section ID": r.section_id ?? r.sectionId ?? "",
    }));
=======
    const sep = ";";
    const filas: string[] = [];
    filas.push(["Rama", "Subrama", "Estado"].join(sep));
>>>>>>> feature/organigrama-Bmerge2

    const quote = (val: string) => `"${(val ?? "").replace(/"/g, '""')}"`;

    for (const r of ramas) {
<<<<<<< HEAD
      const subgroups = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
      if (subgroups && subgroups.length > 0) {
        for (const s of subgroups) {
          hojaSubramas.push({
            Rama: (r.name ?? r.nombre) as string,
            "ID Rama": r.id,
            Subrama: (s.name ?? s.nombre) as string,
            Estado: (s.status === 'active' ? 'activa' : (s.status === 'inactive' ? 'inactiva' : s.estado ?? '')),
            "Descripción Subrama": s.description ?? "",
            "ID Subrama": s.id,
            "Subgroup ID": s.subgroup_id ?? "",
          });
        }
      } else {
        hojaSubramas.push({
          Rama: (r.name ?? r.nombre) as string,
          "ID Rama": r.id,
          Subrama: "— (Sin subramas)",
          Estado: "",
          "Descripción Subrama": "",
          "ID Subrama": "",
          "Subgroup ID": "",
        });
=======
      if (r.subramas && r.subramas.length > 0) {
        for (const s of r.subramas as Subrama[]) {
          const rama = quote(r.nombre);
          const subrama = quote(s.nombre);
          const estado = quote(s.estado ?? "");
          filas.push([rama, subrama, estado].join(sep));
        }
      } else {
        const rama = quote(r.nombre);
        const subrama = quote("— (Sin subramas)");
        const estado = quote(r.estado ?? "");
        filas.push([rama, subrama, estado].join(sep));
>>>>>>> feature/organigrama-Bmerge2
      }
    }

    // BOM para que Excel reconozca UTF-8 correctamente
    const csvContent = "\uFEFF" + filas.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob("organigrama.csv", blob);

<<<<<<< HEAD
    const fitCols = (ws: XLSX.WorkSheet, headers: string[]) => {
      const cols = headers.map((h) => ({ wch: Math.max(12, h.length + 2) }));
      // XLSX types don't include the custom '!cols' property so we use a
      // minimal localized cast here to set column widths.
      (ws as unknown as Record<string, unknown>)["!cols"] = cols;
    };
    if (hojaRamas.length) fitCols(wsRamas, Object.keys(hojaRamas[0]));
    if (hojaSubramas.length) fitCols(wsSubs, Object.keys(hojaSubramas[0]));

    XLSX.utils.book_append_sheet(wb, wsRamas, "Ramas");
    XLSX.utils.book_append_sheet(wb, wsSubs, "Subramas");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    downloadBlob("organigrama.xlsx", blob);
=======
    console.log("✅ CSV exportado correctamente");
>>>>>>> feature/organigrama-Bmerge2
  } catch (e) {
    console.error("❌ Error exportando CSV:", e);
  }
};

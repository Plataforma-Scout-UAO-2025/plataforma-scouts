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
    
    const subgroups = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
    if (subgroups && subgroups.length > 0) {
      for (const s of subgroups) {
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
    console.log("✅ PDF exportado correctamente");
  } catch (e) {
    console.error("❌ Error exportando PDF:", e);
  }
};

/** Exporta Excel con hojas separadas para Ramas y Subramas */
export const exportarOrganigramaExcel = (ramas: Rama[]) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Hoja de Ramas
    const hojaRamas = ramas.map((r) => ({
      Rama: (r.name ?? r.nombre) as string,
      Estado: (r.status === 'active' ? 'activa' : (r.status === 'inactive' ? 'inactiva' : r.estado ?? '')),
      "Descripción Rama": r.description ?? "",
      "Edad mínima": r.minAge ?? "",
      "Edad máxima": r.maxAge ?? "",
      "Año": r.year ?? "",
      "Total subramas": (r.subgroups?.length ?? r.subramas?.length ?? 0),
      "ID Rama": r.id,
      "Section ID": r.section_id ?? r.sectionId ?? "",
    }));

    // Hoja de Subramas
    const hojaSubramas: Array<{
      Rama: string;
      "ID Rama": string;
      Subrama: string;
      Estado: string;
      "Descripción Subrama": string;
      "ID Subrama": string;
      "Subgroup ID": string;
    }> = [];

    for (const r of ramas) {
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
      }
    }

    const wsRamas = XLSX.utils.json_to_sheet(hojaRamas);
    const wsSubs = XLSX.utils.json_to_sheet(hojaSubramas);

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
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    downloadBlob("organigrama.xlsx", blob);
    console.log("✅ Excel exportado correctamente");
  } catch (e) {
    console.error("❌ Error exportando Excel:", e);
  }
};
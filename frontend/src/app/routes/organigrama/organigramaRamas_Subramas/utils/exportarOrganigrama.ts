import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";

type ExportPDFOpts = {
  anio?: number;
  colorHex?: string;
};

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

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [26, 65, 52];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}


function construirFilasDetalle(ramas: Rama[]): string[][] {
  const filas: string[][] = [];

  for (const r of ramas) {
    const ramaNombre = (r.name ?? r.nombre ?? '').toString();
    const descripcionRama = (r.description ?? (r as { descripcion?: string }).descripcion ?? '').toString().trim() ||
      ((typeof r.minAge === 'number' && typeof r.maxAge === 'number' && r.minAge > 0 && r.maxAge > 0)
        ? `${r.minAge}-${r.maxAge} años`
        : '—');

    const jefeRama = (r as { leader?: string; jefe?: string }).leader ??
      (r as { leader?: string; jefe?: string }).jefe ?? (() => {
        const subs = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
        if (subs && subs.length > 0) {
          const leaders = subs.map(s => (s as { leader?: string }).leader).filter(Boolean);
          return leaders.length > 0 ? [...new Set(leaders)].join(', ') : '';
        }
        return '';
      })();

    const subgroups = (r.subgroups ?? r.subramas) as Subrama[] | undefined;

    if (subgroups && subgroups.length > 0) {
      for (const s of subgroups) {
        const nombreSubramaFull = (s.name ?? s.nombre ?? '').toString();

        // Integrantes: múltiples formatos posibles (array o string)
        let integrantes = '';
        const sUnknown = s as unknown as Record<string, unknown>;
        if (sUnknown.members && Array.isArray(sUnknown.members)) {
          integrantes = (sUnknown.members as string[]).join(', ');
        } else if (sUnknown.integrantes && Array.isArray(sUnknown.integrantes)) {
          integrantes = (sUnknown.integrantes as string[]).join(', ');
        } else if (sUnknown.membersNames && Array.isArray(sUnknown.membersNames)) {
          integrantes = (sUnknown.membersNames as string[]).join(', ');
        } else if (typeof sUnknown.integrantes === 'string' && sUnknown.integrantes) {
          integrantes = sUnknown.integrantes;
        } else if (sUnknown.leader) {
          integrantes = String(sUnknown.leader);
        }

        filas.push([
          ramaNombre,
          descripcionRama,
          nombreSubramaFull,
          integrantes,
          jefeRama ?? '',
        ]);
      }
    } else {
      filas.push([
        ramaNombre,
        descripcionRama,
        '— (Sin subramas)',
        '',
        jefeRama ?? '',
      ]);
    }
  }

  return filas;
}

export const exportarOrganigramaPDF = (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  console.log(' [ExportPDF] Iniciando exportación PDF con', ramas.length, 'ramas');
  console.log(' [ExportPDF] Opciones:', opts);
  
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: 'landscape' });
    const x = 40;
    const y = 50;

    const [r, g, b] = hexToRgb(opts.colorHex ?? "#1A4134");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(r, g, b);
    const titulo = "Organigrama Scout" + (opts.anio ? ` – ${opts.anio}` : "");
    doc.text(titulo, x, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generado: ${new Date().toLocaleString()}`, x, y + 16);

    console.log(' [ExportPDF] Construyendo datos para la tabla...');
    const body = construirFilasDetalle(ramas);
    console.log(' [ExportPDF] Tabla tendrá', body.length, 'filas');

    console.log(' [ExportPDF] Generando tabla con autoTable...');
    const pageW = doc.internal.pageSize.getWidth();
    const availableW = pageW - x * 2;
    // Pesos actualizados (sin TipoSubrama)
    const updatedWeights = [12, 12, 32, 28, 11]; // Rama, Descripción, NombreSubrama, Integrantes, JefeRama
    const totalW = updatedWeights.reduce((a, b) => a + b, 0);
    const colW = updatedWeights.map((w) => Math.floor((w / totalW) * availableW));
    const finalColumnStyles: Record<string, { cellWidth: number }> = {};
    colW.forEach((w, i) => (finalColumnStyles[i] = { cellWidth: w }));

    autoTable(doc, {
      startY: y + 32,
      head: [["Rama", "Descripción", "NombreSubrama", "Integrantes", "JefeRama"]],
      body,
      margin: { left: x, right: x },
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [r, g, b], textColor: [255, 255, 255] },
      columnStyles: finalColumnStyles,
      didDrawPage: () => {
      },
    });

    console.log(' [ExportPDF] Guardando archivo organigrama.pdf...');
    doc.save("organigrama.pdf");
    console.log(" [ExportPDF] PDF exportado correctamente");
  } catch (e) {
    console.error(" [ExportPDF] Error exportando PDF:", e);
    throw e; 
  }
};

export const exportarOrganigramaCSV = (ramas: Rama[]) => {
  console.log(' [ExportCSV] Iniciando exportación CSV con', ramas.length, 'ramas');
  
  try {
    console.log(' [ExportCSV] Construyendo datos detallados...');
    const detalleRows = construirFilasDetalle(ramas).map((cols) => ({
      Rama: cols[0],
      Descripción: cols[1],
      NombreSubrama: cols[2],
      Integrantes: cols[3],
      JefeRama: cols[4],
    }));

    console.log(' [ExportCSV] Filas de detalle construidas:', detalleRows.length);

    const objectArrayToCsv = (data: Array<Record<string, unknown>>): string => {
      if (!data || data.length === 0) return "";
      const keys = Object.keys(data[0]);
      const escapeCell = (v: unknown) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      const header = keys.join(',');
      const rows = data.map((row) => keys.map((k) => escapeCell(row[k])).join(','));
      return [header, ...rows].join('\n');
    };

    console.log(' [ExportCSV] Convirtiendo a formato CSV...');
    const csvDetalle = objectArrayToCsv(detalleRows);
    const bom = '\uFEFF';
    const blobDetalle = new Blob([bom + csvDetalle], { type: 'text/csv;charset=utf-8;' });
    
    console.log(' [ExportCSV] Descargando archivo organigrama_detalle.csv...');
    downloadBlob('organigrama_detalle.csv', blobDetalle);

    console.log(' [ExportCSV] CSV detalle exportado correctamente');
  } catch (e) {
    console.error(' [ExportCSV] Error exportando CSV:', e);
    throw e; 
  }
};

export const exportarOrganigramaExcel = exportarOrganigramaCSV;
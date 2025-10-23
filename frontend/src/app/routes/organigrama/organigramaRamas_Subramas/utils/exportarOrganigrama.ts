import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";
import { getMembersBySubgroup } from "@/api/organigramaApi";

// Helper functions to filter out committee branches
const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isCommitteeName = (name: string) => {
  const n = stripAccents(name).toLowerCase();
  // Treat these names as organizational levels (exclude from Branches)
  return n.includes("comit") || n.includes("asamblea") || n.includes("corte") || n.includes("consejo");
};

type ExportPDFOpts = {
  anio?: number;
  colorHex?: string;
  groupName?: string;
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




// Optimized function with parallelization and proper member filtering
async function construirFilasDetalleSimple(ramas: Rama[]): Promise<string[][]> {
  const filas: string[][] = [];

  // Filter out committee branches (comités, asambleas, cortes, consejos)
  const onlyRamas = ramas.filter((r) => {
    const rawName = String(r.name ?? r.nombre ?? '');
    return !isCommitteeName(rawName);
  });

  console.log(' [Export] Procesando', onlyRamas.length, 'ramas con paralelización...');

  // Collect all subgroup IDs for parallel processing
  const allSubgroupRequests: Array<{
    subgroupId: number;
    ramaInfo: {
      ramaNombre: string;
      descripcionRama: string;
      nombreSubrama: string;
      jefeRama: string;
    };
  }> = [];

  // Prepare all requests
  for (const r of onlyRamas) {
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
        const sUnknown = s as unknown as Record<string, unknown>;
        const subgroupId = sUnknown['subgroupId'] ?? sUnknown['id'];
        
        if (subgroupId) {
          allSubgroupRequests.push({
            subgroupId: Number(subgroupId),
            ramaInfo: {
              ramaNombre,
              descripcionRama,
              nombreSubrama: nombreSubramaFull,
              jefeRama: jefeRama ?? '',
            }
          });
        }
      }
    } else {
      // Rama without subgroups
      filas.push([
        ramaNombre,
        descripcionRama,
        '— (Sin subramas)',
        '',
        jefeRama ?? '',
      ]);
    }
  }

  console.log(' [Export] Obteniendo miembros para', allSubgroupRequests.length, 'subgrupos en paralelo...');

  // Execute all member requests in parallel
  const memberPromises = allSubgroupRequests.map(async (request) => {
    try {
      const members = await getMembersBySubgroup(request.subgroupId);
      
      // Filter only active and approved members
      const activeMembers = (members || []).filter((m: Record<string, unknown>) => 
        m.status === 'APPROVED' && m.is_active === true
      );

      // Use full_name directly from API response
      const integrantes = activeMembers
        .map((m: Record<string, unknown>) => m.full_name || '')
        .filter(Boolean)
        .join(', ');

      return {
        ...request.ramaInfo,
        integrantes,
      };
    } catch (error) {
      console.warn(' [Export] Error obteniendo miembros para subgrupo', request.subgroupId, ':', error);
      return {
        ...request.ramaInfo,
        integrantes: '', // Empty if failed
      };
    }
  });

  // Wait for all requests to complete
  const results = await Promise.allSettled(memberPromises);
  
  // Process results
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      filas.push([
        data.ramaNombre,
        data.descripcionRama,
        data.nombreSubrama,
        data.integrantes,
        data.jefeRama,
      ]);
    } else {
      console.warn(' [Export] Promise rejected:', result.reason);
    }
  });

  console.log(' [Export] Procesamiento completado. Total filas:', filas.length);
  return filas;
}

// Legacy function for backward compatibility
async function construirFilasDetalle(ramas: Rama[]): Promise<string[][]> {
  return construirFilasDetalleSimple(ramas);
}

export const exportarOrganigramaPDF = async (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  // Filter out committee branches before processing
  const onlyRamas = ramas.filter((r) => {
    const rawName = String(r.name ?? r.nombre ?? '');
    return !isCommitteeName(rawName);
  });
  
  console.log(' [ExportPDF] Iniciando exportación PDF con', onlyRamas.length, 'ramas (filtradas de', ramas.length, 'totales)');
  console.log(' [ExportPDF] Opciones:', opts);
  
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: 'landscape' });
    const x = 40;
    const y = 50;

    const [r, g, b] = hexToRgb(opts.colorHex ?? "#1A4134");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(r, g, b);
    const titulo = opts.groupName 
      ? `Conformación de ramas scout - ${opts.groupName}` 
      : "Conformación de ramas scout";
    doc.text(titulo, x, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generado: ${new Date().toLocaleString()}`, x, y + 16);

    console.log(' [ExportPDF] Construyendo datos para la tabla...');
    const body = await construirFilasDetalleSimple(onlyRamas);
    console.log(' [ExportPDF] Tabla tendrá', body.length, 'filas');

    console.log(' [ExportPDF] Generando tabla con autoTable...');
    const pageW = doc.internal.pageSize.getWidth();
    const availableW = pageW - x * 2;
    const updatedWeights = [10, 14, 16, 48, 12]; 
    const totalW = updatedWeights.reduce((a, b) => a + b, 0);
    const colW = updatedWeights.map((w) => Math.floor((w / totalW) * availableW));
    const finalColumnStyles: Record<string, { cellWidth: number }> = {};
    colW.forEach((w, i) => (finalColumnStyles[i] = { cellWidth: w }));

    autoTable(doc, {
      startY: y + 32,
      head: [["Rama", "Descripción", "NombreSubrama", "Integrantes", "JefeRama"]],
      body,
      margin: { left: x, right: x },
      styles: { 
        fontSize: 8, 
        cellPadding: 4, 
        overflow: "linebreak",
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      },
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

export const exportarOrganigramaCSV = async (ramas: Rama[]) => {
  // Filter out committee branches before processing
  const onlyRamas = ramas.filter((r) => {
    const rawName = String(r.name ?? r.nombre ?? '');
    return !isCommitteeName(rawName);
  });
  
  console.log(' [ExportCSV] Iniciando exportación CSV optimizada con', onlyRamas.length, 'ramas (filtradas de', ramas.length, 'totales)');
  
  try {
    console.log(' [ExportCSV] Construyendo datos con paralelización y filtrado...');
    const filasDetalle = await construirFilasDetalle(onlyRamas);
    const detalleRows = filasDetalle.map((cols) => ({
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";
import { store } from "@/store/store";
import { fetchSubgroupMembersAction } from "@/store/organigrama/organigramaActions";
import { getMemberFullName, isMemberActiveAndApproved, isMemberScouter } from "@/hooks/useSubgroupMembers";
import KNUT from "@/assets/KNUT.png";
// Simple loader to get image dimensions and use as footer
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

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




// Helper function to get branch leaders (SCOUTERS) from all subgroups of a branch
async function getBranchLeaders(subgroups: Subrama[]): Promise<string> {
  if (!subgroups || subgroups.length === 0) return '';
  
  try {
    // Get all subgroup IDs
    const subgroupIds = subgroups
      .map(s => {
        const sUnknown = s as unknown as Record<string, unknown>;
        return sUnknown['subgroupId'] ?? sUnknown['id'];
      })
      .filter(Boolean)
      .map(Number);

    if (subgroupIds.length === 0) return '';

    // Get members from all subgroups in parallel using Redux actions
    const memberPromises = subgroupIds.map(async (id) => {
      const result = await store.dispatch(fetchSubgroupMembersAction(id));
      if (fetchSubgroupMembersAction.fulfilled.match(result)) {
        return result.payload.members;
      }
      return [];
    });
    const allMembersArrays = await Promise.all(memberPromises);
    
    // Flatten all members and filter for active SCOUTERS
    const allMembers = allMembersArrays.flat();
    const scouters = allMembers.filter(member => 
      isMemberActiveAndApproved(member) && isMemberScouter(member)
    );

    // Get unique scouter names
    const scouterNames = [...new Set(
      scouters.map(member => getMemberFullName(member as typeof member & Record<string, unknown>))
    )];

    return scouterNames.join(', ');
  } catch (error) {
    console.warn(' [Export] Error obteniendo jefes de rama:', error);
    return '';
  }
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

  // Prepare all requests - process branches in parallel to get leaders
  const branchPromises = onlyRamas.map(async (r) => {
    const ramaNombre = (r.name ?? r.nombre ?? '').toString();
    const descripcionRama = (r.description ?? (r as { descripcion?: string }).descripcion ?? '').toString().trim() ||
      ((typeof r.minAge === 'number' && typeof r.maxAge === 'number' && r.minAge > 0 && r.maxAge > 0)
        ? `${r.minAge}-${r.maxAge} años`
        : '—');

    const subgroups = (r.subgroups ?? r.subramas) as Subrama[] | undefined;

    if (subgroups && subgroups.length > 0) {
      // Get branch leaders from all subgroups
      const jefeRama = await getBranchLeaders(subgroups);
      
      const subgroupRequests = [];
      for (const s of subgroups) {
        const nombreSubramaFull = (s.name ?? s.nombre ?? '').toString();
        const sUnknown = s as unknown as Record<string, unknown>;
        const subgroupId = sUnknown['subgroupId'] ?? sUnknown['id'];
        
        if (subgroupId) {
          subgroupRequests.push({
            subgroupId: Number(subgroupId),
            ramaInfo: {
              ramaNombre,
              descripcionRama,
              nombreSubrama: nombreSubramaFull,
              jefeRama: jefeRama,
            }
          });
        }
      }
      return { type: 'subgroups' as const, requests: subgroupRequests };
    } else {
      // Rama without subgroups - no leaders to fetch
      return {
        type: 'direct' as const,
        row: [
          ramaNombre,
          descripcionRama,
          '— (Sin subramas)',
          '',
          '', // No jefe de rama for branches without subgroups
        ] as string[]
      };
    }
  });

  // Wait for all branch processing to complete
  const branchResults = await Promise.all(branchPromises);
  
  // Separate direct rows from subgroup requests
  branchResults.forEach(result => {
    if (result.type === 'direct') {
      filas.push(result.row);
    } else if (result.requests) {
      allSubgroupRequests.push(...result.requests);
    }
  });

  console.log(' [Export] Obteniendo miembros para', allSubgroupRequests.length, 'subgrupos en paralelo...');

  // Execute all member requests in parallel using Redux actions
  const memberPromises = allSubgroupRequests.map(async (request) => {
    try {
      const result = await store.dispatch(fetchSubgroupMembersAction(request.subgroupId));
      const members = fetchSubgroupMembersAction.fulfilled.match(result) ? result.payload.members : [];
      
      // Filter only active and approved members
      const activeMembers = (members || []).filter(member => 
        isMemberActiveAndApproved(member)
      );

      // Separate SCOUTERS (jefes) from regular members
      const scouters = activeMembers.filter(member => isMemberScouter(member));
      const regularMembers = activeMembers.filter(member => !isMemberScouter(member));

      // Get names for integrantes (regular members)
      const integrantes = regularMembers
        .map(member => getMemberFullName(member as typeof member & Record<string, unknown>))
        .join(', ');

      // Get names for jefe de rama (scouters)
      const jefeRama = scouters
        .map(member => getMemberFullName(member as typeof member & Record<string, unknown>))
        .join(', ') || request.ramaInfo.jefeRama; // Fallback to original if no scouters found

      return {
        ...request.ramaInfo,
        jefeRama,
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
    // Precalcular dimensiones del pie de página (logo) y reservar margen
  const footerW = Math.min(120, pageW * 0.18);
    let footerH = 50;
    try {
      const probe = await loadImage(KNUT);
      const ratio = probe.height > 0 ? probe.height / probe.width : 0.45;
      footerH = footerW * ratio;
    } catch { /* keep defaults */ }
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
      margin: { left: x, right: x, bottom: Math.ceil(footerH + 24) },
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
        // Reservado si deseamos dibujar elementos en cada página durante la generación
      },
    });

    // Añadir pie de página con imagen KNUT en todas las páginas
    try {
      const img = await loadImage(KNUT);
      const pageCount: number = (doc as unknown as { getNumberOfPages?: () => number; internal?: { getNumberOfPages?: () => number } }).getNumberOfPages?.() ?? (doc as unknown as { internal?: { getNumberOfPages?: () => number } }).internal?.getNumberOfPages?.() ?? 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginBottom = 18;
        const w = Math.min(footerW, pageWidth * 0.18);
        const ratio = img.height > 0 ? img.height / img.width : footerH / Math.max(footerW, 1);
        const h = w * ratio;
        const xImg = (pageWidth - w) / 2;
        const yImg = pageHeight - h - marginBottom;
  (doc as unknown as { addImage: (imageData: HTMLImageElement | string, format: string, x: number, y: number, w: number, h: number, alias?: string, compression?: "NONE" | "FAST" | "SLOW") => jsPDF }).addImage(img, "PNG", xImg, yImg, w, h, undefined, "FAST");
      }
    } catch (e) {
      console.warn(" [ExportPDF] No se pudo agregar imagen de pie de página KNUT:", e);
    }

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
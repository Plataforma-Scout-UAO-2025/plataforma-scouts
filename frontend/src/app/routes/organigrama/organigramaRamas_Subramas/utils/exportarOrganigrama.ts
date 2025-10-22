import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";
import { getMembersBySubgroup } from "@/api/organigramaApi";

type ExportPDFOpts = {
  anio?: number;
  colorHex?: string;
};

// Detecta si un nombre corresponde a un nivel organizativo (comités, asambleas, cortes, consejos)
function esNivelOrganizativoPorNombre(nombre?: string | null): boolean {
  if (!nombre) return false;
  const norm = nombre
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return (
    norm.includes("comit") ||
    norm.includes("asamblea") ||
    norm.includes("corte") ||
    norm.includes("consejo")
  );
}

function filtrarSoloRamas(ramas: Rama[]): Rama[] {
  const filtradas = ramas.filter((r) => !esNivelOrganizativoPorNombre((r as any).name ?? (r as any).nombre));
  if (filtradas.length !== ramas.length) {
    console.log(
      ` [Export] Filtrado de niveles organizativos: ${ramas.length - filtradas.length} removidos, ${filtradas.length} ramas restantes`
    );
  }
  return filtradas;
}

// Ordena las ramas con el mismo criterio de la UI: Cachorros, Manada, Webelos, Tropa, Clan; resto alfabético
function ordenarRamasComoUI(ramas: Rama[]): Rama[] {
  const orden = ['cachorros', 'manada', 'webelos', 'tropa', 'clan'];
  const getIndex = (name?: string | null) => {
    const n = String(name ?? '').toLowerCase();
    const idx = orden.findIndex((o) => n.includes(o));
    return idx === -1 ? Number.POSITIVE_INFINITY : idx; // no match goes to the end
  };
  return [...ramas].sort((a, b) => {
    const nameA = (a as any).name ?? (a as any).nombre ?? '';
    const nameB = (b as any).name ?? (b as any).nombre ?? '';
    const idxA = getIndex(nameA);
    const idxB = getIndex(nameB);
    if (idxA !== idxB) return idxA - idxB;
    // same bucket: alphabetical fallback
    return String(nameA).localeCompare(String(nameB));
  });
}

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


async function construirFilasDetalle(ramas: Rama[]): Promise<string[][]> {
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

        // Obtener miembros de la subrama
        let integrantes = '';
        try {
          const sUnknown = s as unknown as Record<string, unknown>;
          const subgroupId = sUnknown['subgroupId'] ?? sUnknown['id'];
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
          console.warn(' [Export] Error obteniendo miembros para subrama:', s.name ?? s.nombre, error);
          // Fallback: intentar usar datos existentes si están disponibles
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

export const exportarOrganigramaPDF = async (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  console.log(' [ExportPDF] Iniciando exportación PDF con', ramas.length, 'ramas (antes de filtrar)');
  // Asegurar que en export no se cuelen niveles organizativos
  const ramasVisibles = ordenarRamasComoUI(filtrarSoloRamas(ramas));
  console.log(' [ExportPDF] Exportando', ramasVisibles.length, 'ramas (tras filtrar niveles organizativos)');
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
  const body = await construirFilasDetalle(ramasVisibles);
    console.log(' [ExportPDF] Tabla tendrá', body.length, 'filas');

    console.log(' [ExportPDF] Generando tabla con autoTable...');
    const pageW = doc.internal.pageSize.getWidth();
    const availableW = pageW - x * 2;
    const updatedWeights = [12, 12, 32, 28, 11]; 
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

export const exportarOrganigramaCSV = async (ramas: Rama[]) => {
  console.log(' [ExportCSV] Iniciando exportación CSV con', ramas.length, 'ramas (antes de filtrar)');
  const ramasVisibles = ordenarRamasComoUI(filtrarSoloRamas(ramas));
  console.log(' [ExportCSV] Exportando', ramasVisibles.length, 'ramas (tras filtrar niveles organizativos)');
  
  try {
    console.log(' [ExportCSV] Construyendo datos detallados...');
    const filasDetalle = await construirFilasDetalle(ramasVisibles);
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
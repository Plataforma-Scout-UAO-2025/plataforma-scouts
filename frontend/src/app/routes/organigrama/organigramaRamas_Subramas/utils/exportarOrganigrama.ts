import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Branch as Rama, Subgroup as Subrama } from "../types/frontend";
import { getMembersBySubgroup } from "@/api/organigramaApi";

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


async function construirFilasDetalle(ramas: Rama[]): Promise<string[][]> {
  const filas: string[][] = [];

  for (const r of ramas) {
    console.log('🔍 [ExportUtils] Procesando rama:', r.name ?? r.nombre, '- ID:', r.id);
    
    const ramaNombre = (r.name ?? r.nombre ?? '').toString();
    
    // CORRECCIÓN: Usar descripción real de la rama en lugar de edad calculada
    const descripcionRama = (r.description ?? (r as { descripcion?: string }).descripcion ?? '').toString().trim() || 
                           // Solo como fallback mostrar edad si no hay descripción
                           ((typeof r.minAge === 'number' && typeof r.maxAge === 'number' && r.minAge > 0 && r.maxAge > 0)
                           ? `${r.minAge}-${r.maxAge} años`
                           : '—');

    console.log('📝 [ExportUtils] Rama procesada:', {
      nombre: ramaNombre,
      descripcionOriginal: r.description,
      descripcionLegacy: (r as { descripcion?: string }).descripcion,
      descripcionFinal: descripcionRama,
      esDescripcionReal: !!(r.description ?? (r as { descripcion?: string }).descripcion),
      esFallbackEdad: !(r.description ?? (r as { descripcion?: string }).descripcion)
    });

    // Jefe de rama: buscar propiedades comunes o fallback a líderes de subramas
    const jefeRama = (r as { leader?: string; jefe?: string }).leader ?? 
                     (r as { leader?: string; jefe?: string }).jefe ?? (() => {
      const subs = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
      if (subs && subs.length > 0) {
        // obtener líderes únicos de las subramas (si existen)
        const leaders = subs.map(s => (s as { leader?: string }).leader).filter(Boolean);
        return leaders.length > 0 ? [...new Set(leaders)].join(', ') : '';
      }
      return '';
    })();

    const subgroups = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
    console.log('📊 [ExportUtils] Rama', ramaNombre, 'tiene', subgroups?.length ?? 0, 'subramas');

    if (subgroups && subgroups.length > 0) {
      for (const s of subgroups) {
        console.log('🔍 [ExportUtils] Procesando subrama:', s.name ?? s.nombre, '- ID:', s.id);
        
        const nombreSubramaFull = (s.name ?? s.nombre ?? '').toString();

        // Obtener miembros de la subrama
        let integrantes = '';
        try {
          const sUnknown = s as unknown as Record<string, unknown>;
          const subgroupId = sUnknown['subgroupId'] ?? sUnknown['id'];
          if (subgroupId) {
            const members = await getMembersBySubgroup(Number(subgroupId));
            if (members && members.length > 0) {
              integrantes = members.map((m: any) => {
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
          tipoSubrama,
          nombreSubramaFull,
          estado,
          integrantes,
          jefeRama ?? '',
        ]);
      }
    } else {
      console.log('⚠️ [ExportUtils] Rama sin subramas:', ramaNombre);
      // Rama sin subramas: fila con subrama vacía
      const ramaEstado = (r.status === 'active' ? 'activa' : 
                         (r.status === 'inactive' ? 'inactiva' : 
                         ((r as unknown as { isActive?: boolean }).isActive === true ? 'activa' :
                         ((r as unknown as { isActive?: boolean }).isActive === false ? 'inactiva' :
                         ((r as unknown as { estado?: string }).estado ?? 'desconocido')))));
      
      filas.push([
        ramaNombre,
        descripcionRama,
        '',
        '— (Sin subramas)',
        ramaEstado,
        '',
        jefeRama ?? '',
      ]);
    }
  }

  console.log('✅ [ExportUtils] Filas construidas exitosamente:', filas.length, 'filas');
  return filas;
}

export const exportarOrganigramaPDF = async (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  console.log(' [ExportPDF] Iniciando exportación PDF con', ramas.length, 'ramas');
  console.log(' [ExportPDF] Opciones:', opts);
  
  try {
    // Usar landscape para más ancho y ajustar margenes
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: 'landscape' });
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

    console.log(' [ExportPDF] Construyendo datos para la tabla...');
    const body = await construirFilasDetalle(ramas);
    console.log(' [ExportPDF] Tabla tendrá', body.length, 'filas');

    // Calcular anchos de columna para que quepan dentro del área imprimible
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - x * 2; // restar margenes

    // Pesos relativos para distribuir espacio entre columnas (ajustables)
    const weights = [12, 7, 7, 32, 6, 28, 11];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const colWidths = weights.map((w) => Math.floor((w / totalWeight) * availableWidth));

    const columnStyles: Record<string, { cellWidth: number }> = {};
    colWidths.forEach((w, i) => {
      columnStyles[i] = { cellWidth: w };
    });

    console.log('📊 [ExportPDF] Generando tabla con autoTable...');
    autoTable(doc, {
      startY: y + 32,
      head: [["Rama", "Descripción", "TipoSubrama", "NombreSubrama", "Estado", "Integrantes", "JefeRama"]],
      body,
      margin: { left: x, right: x },
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [r, g, b], textColor: [255, 255, 255] },
      columnStyles,
      didDrawPage: () => {
        // nada adicional por ahora
      },
    });

    console.log('💾 [ExportPDF] Guardando archivo organigrama.pdf...');
    doc.save("organigrama.pdf");
    console.log("✅ [ExportPDF] PDF exportado correctamente");
  } catch (e) {
    console.error("❌ [ExportPDF] Error exportando PDF:", e);
    throw e; // Re-lanzar para que el componente pueda manejarlo
  }
};

export const exportarOrganigramaCSV = async (ramas: Rama[]) => {
  console.log(' [ExportCSV] Iniciando exportación CSV con', ramas.length, 'ramas');
  
  try {
    console.log(' [ExportCSV] Construyendo datos detallados...');
    const filasDetalle = await construirFilasDetalle(ramas);
    const detalleRows = filasDetalle.map((cols) => ({
      Rama: cols[0],
      Descripción: cols[1],
      TipoSubrama: cols[2],
      NombreSubrama: cols[3],
      Estado: cols[4],
      Integrantes: cols[5],
      JefeRama: cols[6],
    }));

    console.log('📊 [ExportCSV] Filas de detalle construidas:', detalleRows.length);

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

    console.log('📊 [ExportCSV] Convirtiendo a formato CSV...');
    const csvDetalle = objectArrayToCsv(detalleRows);
    const bom = '\uFEFF'; // BOM para UTF-8 en Excel
    const blobDetalle = new Blob([bom + csvDetalle], { type: 'text/csv;charset=utf-8;' });
    
    console.log('💾 [ExportCSV] Descargando archivo organigrama_detalle.csv...');
    downloadBlob('organigrama_detalle.csv', blobDetalle);

    console.log('✅ [ExportCSV] CSV detalle exportado correctamente');
  } catch (e) {
    console.error('❌ [ExportCSV] Error exportando CSV:', e);
    throw e; // Re-lanzar para que el componente pueda manejarlo
  }
};

// Alias por compatibilidad hacia atrás: antes se llamaba exportarOrganigramaExcel
export const exportarOrganigramaExcel = exportarOrganigramaCSV;
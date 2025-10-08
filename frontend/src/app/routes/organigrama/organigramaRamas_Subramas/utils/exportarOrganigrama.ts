import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

/** Construye filas planas detalladas con las columnas solicitadas:
 * Rama, Descripción, TipoSubrama, NombreSubrama, Estado, Integrantes, JefeRama
 */
function construirFilasDetalle(ramas: Rama[]): string[][] {
  console.log('🔄 [ExportUtils] Construyendo filas detalladas para', ramas.length, 'ramas');
  const filas: string[][] = [];

  for (const r of ramas) {
    console.log('🔍 [ExportUtils] Procesando rama:', r.name ?? r.nombre, '- ID:', r.id);
    
    const ramaNombre = (r.name ?? r.nombre ?? '').toString();
    
    // CORRECCIÓN: Usar descripción real de la rama en lugar de edad calculada
    const descripcionRama = (r.description ?? (r as any).descripcion ?? '').toString().trim() || 
                           // Solo como fallback mostrar edad si no hay descripción
                           ((typeof r.minAge === 'number' && typeof r.maxAge === 'number' && r.minAge > 0 && r.maxAge > 0)
                           ? `${r.minAge}-${r.maxAge} años`
                           : '—');

    console.log('📝 [ExportUtils] Rama procesada:', {
      nombre: ramaNombre,
      descripcionOriginal: r.description,
      descripcionLegacy: (r as any).descripcion,
      descripcionFinal: descripcionRama,
      esDescripcionReal: Boolean(r.description ?? (r as any).descripcion),
      esFallbackEdad: !Boolean(r.description ?? (r as any).descripcion)
    });

    // Jefe de rama: buscar propiedades comunes o fallback a líderes de subramas
    const jefeRama = (r as any).leader ?? (r as any).jefe ?? (() => {
      const subs = (r.subgroups ?? r.subramas) as Subrama[] | undefined;
      if (subs && subs.length > 0) {
        // obtener líderes únicos de las subramas (si existen)
        const leaders = subs.map(s => (s as any).leader).filter(Boolean);
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

        // intentar extraer tipo si el nombre tiene formato "Tipo: Nombre" o como primera palabra
        let tipoSubrama = '';
        const tipoCandidates = [
          (s as any).tipo,
          (s as any).tipoSubrama,
          (s as any).type,
          (s as any).subtype,
        ];
        for (const c of tipoCandidates) {
          if (c) {
            tipoSubrama = String(c).trim();
            break;
          }
        }

        if (!tipoSubrama) {
          if (nombreSubramaFull.includes(':')) {
            tipoSubrama = nombreSubramaFull.split(':')[0].trim();
          } else if (nombreSubramaFull.includes(' ')) {
            // si no hay ':' tomar la primera palabra como tipo (Patrulla Panteras -> Patrulla)
            tipoSubrama = nombreSubramaFull.split(' ')[0].trim();
          }
        }

        // Estado: buscar múltiples propiedades posibles
        const estado = (s.status === 'active' ? 'activa' : 
                      (s.status === 'inactive' ? 'inactiva' : 
                      ((s as any).isActive === true ? 'activa' :
                      ((s as any).isActive === false ? 'inactiva' :
                      ((s as any).estado ?? 'desconocido')))));

        // Integrantes: múltiples formatos posibles (array o string)
        let integrantes = '';
        if ((s as any).members && Array.isArray((s as any).members)) {
          integrantes = (s as any).members.join(', ');
        } else if ((s as any).integrantes && Array.isArray((s as any).integrantes)) {
          integrantes = (s as any).integrantes.join(', ');
        } else if ((s as any).membersNames && Array.isArray((s as any).membersNames)) {
          integrantes = (s as any).membersNames.join(', ');
        } else if (typeof (s as any).integrantes === 'string' && (s as any).integrantes) {
          integrantes = (s as any).integrantes;
        } else if ((s as any).leader) {
          integrantes = String((s as any).leader);
        }

        console.log('📝 [ExportUtils] Datos procesados para subrama:', {
          nombre: nombreSubramaFull,
          tipo: tipoSubrama,
          estado,
          integrantes: integrantes.substring(0, 50) + (integrantes.length > 50 ? '...' : '')
        });

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
                         ((r as any).isActive === true ? 'activa' :
                         ((r as any).isActive === false ? 'inactiva' :
                         ((r as any).estado ?? 'desconocido')))));
      
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

/** Exporta PDF manteniendo jerarquía Rama→Subrama */
export const exportarOrganigramaPDF = (ramas: Rama[], opts: ExportPDFOpts = {}) => {
  console.log('🔄 [ExportPDF] Iniciando exportación PDF con', ramas.length, 'ramas');
  console.log('🔄 [ExportPDF] Opciones:', opts);
  
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

    console.log('📊 [ExportPDF] Construyendo datos para la tabla...');
    const body = construirFilasDetalle(ramas); // string[][] detalle
    console.log('📊 [ExportPDF] Tabla tendrá', body.length, 'filas');

    // Calcular anchos de columna para que quepan dentro del área imprimible
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - x * 2; // restar margenes

    // Pesos relativos para distribuir espacio entre columnas (ajustables)
    const weights = [12, 7, 7, 32, 6, 28, 11];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const colWidths = weights.map((w) => Math.floor((w / totalWeight) * availableWidth));

    const columnStyles: Record<string, any> = {};
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

/** Exporta CSV con hojas separadas para Ramas y Subramas */
export const exportarOrganigramaCSV = (ramas: Rama[]) => {
  console.log('🔄 [ExportCSV] Iniciando exportación CSV con', ramas.length, 'ramas');
  
  try {
    console.log('📊 [ExportCSV] Construyendo datos detallados...');
    // Construir hoja detallada (una fila por subrama, o una fila por rama si no tiene subramas)
    const detalleRows = construirFilasDetalle(ramas).map((cols) => ({
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
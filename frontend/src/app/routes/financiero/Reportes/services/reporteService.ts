import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { Grupo, MiembroPago, EstadoPago, ReportePagos, FiltrosReporte } from "../types/reporte.type";

// Datos mock de grupos
export const GRUPOS_MOCK: Grupo[] = [
  {
    id: "1",
    nombre: "Manada Kuna",
    edadMinima: 7,
    edadMaxima: 11,
    miembrosActivos: 15
  },
  {
    id: "2",
    nombre: "Tropa Paez",
    edadMinima: 11,
    edadMaxima: 15,
    miembrosActivos: 20
  },
  {
    id: "3",
    nombre: "Clan Muisca",
    edadMinima: 15,
    edadMaxima: 18,
    miembrosActivos: 10
  }
];

// Nombres y apellidos para generar datos mock
const NOMBRES = [
  "Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "Pedro", "Laura", 
  "José", "Isabel", "Miguel", "Elena", "David", "Patricia", "Alberto",
  "Rosa", "Fernando", "Lucía", "Roberto", "Cristina", "Manuel", "Sara"
];

const APELLIDOS = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez",
  "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández",
  "Díaz", "Moreno", "Álvarez", "Muñoz", "Romero", "Alonso", "Gutiérrez"
];

// Función para generar un número aleatorio entre min y max
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Función para obtener un elemento aleatorio de un array
const randomItem = <T>(array: T[]): T => {
  return array[random(0, array.length - 1)];
};

// Función para generar una fecha aleatoria en un rango
const randomDate = (start: Date, end: Date): Date => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

// Función para generar miembros mock
const generarMiembrosMock = (cantidad: number, fechaInicio: Date, fechaFin: Date): MiembroPago[] => {
  const miembros: MiembroPago[] = [];
  
  for (let i = 0; i < cantidad; i++) {
    const nombre = randomItem(NOMBRES);
    const apellido = randomItem(APELLIDOS);
    const montoTotal = random(40000, 80000); // Montos entre $40,000 y $80,000
    
    // Determinar estado con probabilidades realistas
    const estadoRandom = Math.random();
    let estado: EstadoPago;
    let montoPagado: number;
    let fechaUltimoPago: string | undefined;
    let diasVencido: number | undefined;
    
    if (estadoRandom < 0.6) { // 60% pagado
      estado = "pagado";
      montoPagado = montoTotal;
      fechaUltimoPago = randomDate(fechaInicio, fechaFin).toISOString().split('T')[0];
    } else if (estadoRandom < 0.8) { // 20% pendiente
      estado = "pendiente";
      montoPagado = random(0, montoTotal - 10000);
      if (montoPagado > 0) {
        fechaUltimoPago = randomDate(fechaInicio, new Date()).toISOString().split('T')[0];
      }
    } else { // 20% vencido
      estado = "vencido";
      montoPagado = random(0, montoTotal - 15000);
      diasVencido = random(1, 45);
      if (montoPagado > 0) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() - diasVencido - random(1, 30));
        fechaUltimoPago = fechaVencimiento.toISOString().split('T')[0];
      }
    }
    
    miembros.push({
      id: `miembro-${i + 1}`,
      nombre,
      apellido,
      estado,
      montoPagado,
      montoTotal,
      fechaUltimoPago,
      diasVencido
    });
  }
  
  return miembros;
};

// Función para calcular el resumen financiero
const calcularResumen = (miembros: MiembroPago[]) => {
  const totalIngresos = miembros.reduce((sum, m) => sum + m.montoPagado, 0);
  const totalPendiente = miembros
    .filter(m => m.estado === "pendiente")
    .reduce((sum, m) => sum + (m.montoTotal - m.montoPagado), 0);
  const totalVencido = miembros
    .filter(m => m.estado === "vencido")
    .reduce((sum, m) => sum + (m.montoTotal - m.montoPagado), 0);
  const miembrosCumplidos = miembros.filter(m => m.estado === "pagado").length;
  const miembrosAtrasados = miembros.filter(m => m.estado === "vencido").length;
  const totalMiembros = miembros.length;
  const porcentajeCumplimiento = totalMiembros > 0 ? (miembrosCumplidos / totalMiembros) * 100 : 0;
  
  return {
    totalIngresos,
    totalPendiente,
    totalVencido,
    miembrosCumplidos,
    miembrosAtrasados,
    totalMiembros,
    porcentajeCumplimiento
  };
};

// Función principal para generar el reporte
export const generarReporteMock = (filtros: FiltrosReporte): Promise<ReportePagos> => {
  return new Promise((resolve) => {
    // Simular delay de API
    setTimeout(() => {
      const grupo = GRUPOS_MOCK.find(g => g.id === filtros.grupoId);
      if (!grupo) {
        throw new Error("Grupo no encontrado");
      }
      
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);
      
      // Generar miembros mock basado en el número de miembros activos del grupo
      const miembros = generarMiembrosMock(grupo.miembrosActivos, fechaInicio, fechaFin);
      
      // Calcular resumen
      const resumen = calcularResumen(miembros);
      
      const reporte: ReportePagos = {
        grupo,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        resumen,
        miembros,
        generadoEn: new Date().toISOString()
      };
      
      resolve(reporte);
    }, 1000); // Simular 1 segundo de delay
  });
};

// Función para exportar reporte a Excel
export const exportarReporteExcel = (reporte: ReportePagos): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Crear nuevo workbook
        const wb = XLSX.utils.book_new();

        // Hoja 1: Resumen del Reporte
        const resumenData = [
          ['REPORTE DE PAGOS - ' + reporte.grupo.nombre.toUpperCase()],
          [''],
          ['Información del Grupo'],
          ['Nombre del Grupo', reporte.grupo.nombre],
          ['Rango de Edad', `${reporte.grupo.edadMinima} - ${reporte.grupo.edadMaxima} años`],
          ['Miembros Activos', reporte.grupo.miembrosActivos],
          [''],
          ['Periodo del Reporte'],
          ['Fecha de Inicio', reporte.fechaInicio],
          ['Fecha de Fin', reporte.fechaFin],
          ['Generado el', new Date(reporte.generadoEn).toLocaleString('es-CO')],
          [''],
          ['Resumen Financiero'],
          ['Total Ingresos', reporte.resumen.totalIngresos],
          ['Total Pendiente', reporte.resumen.totalPendiente],
          ['Total Vencido', reporte.resumen.totalVencido],
          [''],
          ['Resumen de Miembros'],
          ['Miembros Cumplidos', reporte.resumen.miembrosCumplidos],
          ['Miembros Atrasados', reporte.resumen.miembrosAtrasados],
          ['Total Miembros', reporte.resumen.totalMiembros],
          ['% Cumplimiento', `${reporte.resumen.porcentajeCumplimiento.toFixed(1)}%`],
        ];

        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

        // Aplicar estilos al resumen
        wsResumen['!cols'] = [
          { width: 25 },
          { width: 20 }
        ];

        // Hoja 2: Detalle de Miembros
        const miembrosHeaders = [
          'ID',
          'Nombre',
          'Apellido', 
          'Estado',
          'Monto Pagado',
          'Monto Total',
          'Pendiente',
          'Último Pago',
          'Días Vencido'
        ];

        const miembrosData = reporte.miembros.map(miembro => [
          miembro.id,
          miembro.nombre,
          miembro.apellido,
          miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1),
          miembro.montoPagado,
          miembro.montoTotal,
          miembro.montoTotal - miembro.montoPagado,
          miembro.fechaUltimoPago || 'Sin pagos',
          miembro.diasVencido || ''
        ]);

        const wsMiembros = XLSX.utils.aoa_to_sheet([miembrosHeaders, ...miembrosData]);

        // Configurar ancho de columnas para miembros
        wsMiembros['!cols'] = [
          { width: 12 }, // ID
          { width: 15 }, // Nombre
          { width: 15 }, // Apellido
          { width: 12 }, // Estado
          { width: 15 }, // Monto Pagado
          { width: 15 }, // Monto Total
          { width: 15 }, // Pendiente
          { width: 15 }, // Último Pago
          { width: 12 }  // Días Vencido
        ];

        // Agregar hojas al workbook
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        XLSX.utils.book_append_sheet(wb, wsMiembros, 'Detalle Miembros');

        // Generar nombre del archivo
        const fileName = `reporte-pagos-${reporte.grupo.nombre.toLowerCase().replace(/\s+/g, '-')}-${reporte.fechaInicio}-${reporte.fechaFin}.xlsx`;

        // Exportar archivo
        XLSX.writeFile(wb, fileName);

        resolve();
      } catch (error) {
        console.error('Error al exportar a Excel:', error);
        throw error;
      }
    }, 500);
  });
};

// Función para exportar reporte a PDF usando solo jsPDF
export const exportarReportePDF = (reporte: ReportePagos): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 295;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        // Función auxiliar para agregar texto
        const addText = (text: string, x: number, y: number, options: { fontSize?: number; fontStyle?: string; color?: number; maxWidth?: number; lineHeight?: number } = {}) => {
          if (options.fontSize) pdf.setFontSize(options.fontSize);
          if (options.fontStyle) pdf.setFont('helvetica', options.fontStyle);
          if (options.color) pdf.setTextColor(options.color);
          
          const lines = pdf.splitTextToSize(text, options.maxWidth || contentWidth);
          pdf.text(lines, x, y);
          return y + (lines.length * (options.lineHeight || 7));
        };

        // Título principal
        pdf.setTextColor(59, 130, 246); // color primary
        currentY = addText(
          `REPORTE DE PAGOS - ${reporte.grupo.nombre.toUpperCase()}`,
          margin,
          currentY,
          { fontSize: 18, fontStyle: 'bold', lineHeight: 10 }
        );

        currentY += 10;

        // Información del grupo
        pdf.setTextColor(0, 0, 0);
        currentY = addText('INFORMACIÓN DEL GRUPO', margin, currentY, { fontSize: 14, fontStyle: 'bold' });
        currentY += 5;
        
        currentY = addText(`Nombre: ${reporte.grupo.nombre}`, margin, currentY);
        currentY = addText(`Rango de Edad: ${reporte.grupo.edadMinima} - ${reporte.grupo.edadMaxima} años`, margin, currentY);
        currentY = addText(`Miembros Activos: ${reporte.grupo.miembrosActivos}`, margin, currentY);
        currentY += 10;

        // Periodo del reporte
        currentY = addText('PERIODO DEL REPORTE', margin, currentY, { fontSize: 14, fontStyle: 'bold' });
        currentY += 5;
        
        currentY = addText(`Fecha de Inicio: ${reporte.fechaInicio}`, margin, currentY);
        currentY = addText(`Fecha de Fin: ${reporte.fechaFin}`, margin, currentY);
        currentY = addText(`Generado: ${new Date(reporte.generadoEn).toLocaleString('es-CO')}`, margin, currentY);
        currentY += 10;

        // Resumen financiero
        currentY = addText('RESUMEN FINANCIERO', margin, currentY, { fontSize: 14, fontStyle: 'bold' });
        currentY += 5;
        
        const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(amount);

        pdf.setTextColor(22, 163, 74); // green
        currentY = addText(`Total Ingresos: ${formatCurrency(reporte.resumen.totalIngresos)}`, margin, currentY);
        pdf.setTextColor(202, 138, 4); // yellow
        currentY = addText(`Total Pendiente: ${formatCurrency(reporte.resumen.totalPendiente)}`, margin, currentY);
        pdf.setTextColor(220, 38, 38); // red
        currentY = addText(`Total Vencido: ${formatCurrency(reporte.resumen.totalVencido)}`, margin, currentY);
        
        pdf.setTextColor(0, 0, 0);
        currentY = addText(`Miembros Cumplidos: ${reporte.resumen.miembrosCumplidos}`, margin, currentY);
        currentY = addText(`Miembros Atrasados: ${reporte.resumen.miembrosAtrasados}`, margin, currentY);
        currentY = addText(`% Cumplimiento: ${reporte.resumen.porcentajeCumplimiento.toFixed(1)}%`, margin, currentY);
        currentY += 10;

        // Detalle de miembros
        currentY = addText('DETALLE DE MIEMBROS', margin, currentY, { fontSize: 14, fontStyle: 'bold' });
        currentY += 5;

        // Headers de tabla
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nombre', margin, currentY);
        pdf.text('Estado', margin + 50, currentY);
        pdf.text('Pagado', margin + 80, currentY);
        pdf.text('Total', margin + 110, currentY);
        pdf.text('Último Pago', margin + 140, currentY);
        currentY += 7;

        // Línea separadora
        pdf.line(margin, currentY - 2, margin + contentWidth, currentY - 2);
        currentY += 3;

        // Datos de miembros
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        reporte.miembros.forEach((miembro) => {
          // Verificar si necesitamos una nueva página
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }

          // Color según estado
          if (miembro.estado === 'pagado') {
            pdf.setTextColor(22, 163, 74); // green
          } else if (miembro.estado === 'pendiente') {
            pdf.setTextColor(202, 138, 4); // yellow
          } else {
            pdf.setTextColor(220, 38, 38); // red
          }

          const nombreCompleto = `${miembro.nombre} ${miembro.apellido}`;
          pdf.text(nombreCompleto.substring(0, 20), margin, currentY);
          pdf.text(miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1), margin + 50, currentY);
          
          pdf.setTextColor(0, 0, 0);
          pdf.text(formatCurrency(miembro.montoPagado), margin + 80, currentY);
          pdf.text(formatCurrency(miembro.montoTotal), margin + 110, currentY);
          pdf.text(miembro.fechaUltimoPago || 'Sin pagos', margin + 140, currentY);

          currentY += 6;
        });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          'Este reporte fue generado automáticamente por el sistema de gestión de scouts.',
          margin,
          pageHeight - 15
        );

        // Generar nombre del archivo
        const fileName = `reporte-pagos-${reporte.grupo.nombre.toLowerCase().replace(/\s+/g, '-')}-${reporte.fechaInicio}-${reporte.fechaFin}.pdf`;

        // Descargar PDF
        pdf.save(fileName);

        resolve();
      } catch (error) {
        console.error('Error al exportar a PDF:', error);
        reject(error);
      }
    }, 500);
  });
};


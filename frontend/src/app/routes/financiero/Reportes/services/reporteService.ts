import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Grupo, FiltrosReporte, FinancialReport, ReportPayments } from "@/types/reporte-financiero.type";

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

// Función para generar pagos mock
const generarPagosMock = (cantidad: number, fechaInicio: Date, fechaFin: Date): ReportPayments[] => {
  const pagos: ReportPayments[] = [];
  
  for (let i = 0; i < cantidad; i++) {
    const nombre = randomItem(NOMBRES);
    const apellido = randomItem(APELLIDOS);
    const monto = random(40000, 80000); // Montos entre $40,000 y $80,000
    
    // Determinar estado con probabilidades realistas
    const estadoRandom = Math.random();
    let paidAt: Date | null = null;
    
    if (estadoRandom < 0.6) { // 60% pagado
      paidAt = randomDate(fechaInicio, fechaFin);
    } else if (estadoRandom < 0.8) { // 20% pendiente
      // Sin pago
      paidAt = null;
    } else { // 20% vencido
      // Pagado pero hace mucho tiempo
      const fechaVencida = new Date();
      fechaVencida.setDate(fechaVencida.getDate() - random(1, 45));
      paidAt = fechaVencida;
    }
    
    pagos.push({
      payment_id: `payment-${i + 1}`,
      first_name: nombre,
      last_name: apellido,
      amount: monto,
      paid_at: paidAt
    });
  }
  
  return pagos;
};

// Función principal para generar el reporte
export const generarReporteMock = (filtros: FiltrosReporte): Promise<FinancialReport> => {
  return new Promise((resolve) => {
    // Simular delay de API
    setTimeout(() => {
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);
      
      // Generar una cantidad de pagos basada en el alcance
      let cantidadMiembros = 15; // Default
      let scopeName = filtros.scope.toLowerCase();
      
      if (filtros.associated_to) {
        // Si hay un asociado específico, usar una cantidad menor
        cantidadMiembros = 8;
      }
      
      // Generar pagos mock
      const pagos = generarPagosMock(cantidadMiembros, fechaInicio, fechaFin);
      
      // Calcular resumen financiero
      const incomes = pagos.filter(p => p.paid_at !== null).reduce((sum, p) => sum + p.amount, 0);
      const pending = pagos.filter(p => p.paid_at === null).length * 50000; // Estimado
      const overdue = Math.floor(pending * 0.3); // 30% vencidos
      
      const members_ok = pagos.filter(p => p.paid_at !== null).length;
      const members_overdue = pagos.filter(p => p.paid_at === null).length;
      const total = pagos.length;
      const percentage = total > 0 ? (members_ok / total) * 100 : 0;
      
      const reporte: FinancialReport = {
        financial_summary: {
          incomes,
          pending,
          overdue
        },
        members_ok,
        members_overdue,
        percentage,
        payments: pagos,
        metadata: {
          generated_for: scopeName, // Alcance del reporte
          start_date: fechaInicio,
          end_date: fechaFin,
          generated_date: new Date()
        }
      };
      
      resolve(reporte);
    }, 1000); // Simular 1 segundo de delay
  });
};

// Función para exportar reporte a Excel
export const exportarReporteExcel = (reporte: FinancialReport): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Crear nuevo workbook
        const wb = XLSX.utils.book_new();

        // Hoja 1: Resumen del Reporte
        const resumenData = [
          ['REPORTE DE PAGOS - ' + reporte.metadata.generated_for.toUpperCase()],
          [''],
          ['Información del Reporte'],
          ['Alcance', reporte.metadata.generated_for],
          ['Total Pagos', reporte.payments.length],
          [''],
          ['Periodo del Reporte'],
          ['Fecha de Inicio', reporte.metadata.start_date.toISOString().split('T')[0]],
          ['Fecha de Fin', reporte.metadata.end_date.toISOString().split('T')[0]],
          ['Generado el', reporte.metadata.generated_date.toLocaleString('es-CO')],
          [''],
          ['Resumen Financiero'],
          ['Total Ingresos', reporte.financial_summary.incomes],
          ['Total Pendiente', reporte.financial_summary.pending],
          ['Total Vencido', reporte.financial_summary.overdue],
          [''],
          ['Resumen de Miembros'],
          ['Miembros Cumplidos', reporte.members_ok],
          ['Miembros Atrasados', reporte.members_overdue],
          ['Total Miembros', reporte.payments.length],
          ['% Cumplimiento', `${reporte.percentage.toFixed(1)}%`],
        ];

        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

        // Aplicar estilos al resumen
        wsResumen['!cols'] = [
          { width: 25 },
          { width: 20 }
        ];

        // Hoja 2: Detalle de Pagos
        const pagosHeaders = [
          'ID',
          'Nombre',
          'Apellido', 
          'Monto',
          'Estado',
          'Fecha de Pago'
        ];

        // Función para determinar el estado del pago
        const getEstadoPago = (paidAt: Date | null) => {
          if (paidAt !== null) {
            return 'Pagado';
          }
          // Verificar si está vencido comparando con la fecha de fin
          const ahora = new Date();
          if (ahora > reporte.metadata.end_date) {
            return 'Vencido';
          }
          return 'Pendiente';
        };

        const pagosData = reporte.payments.map(pago => [
          pago.payment_id,
          pago.first_name,
          pago.last_name,
          pago.amount,
          getEstadoPago(pago.paid_at),
          pago.paid_at ? pago.paid_at.toISOString().split('T')[0] : 'Sin pagos'
        ]);

        const wsPagos = XLSX.utils.aoa_to_sheet([pagosHeaders, ...pagosData]);

        // Configurar ancho de columnas para pagos
        wsPagos['!cols'] = [
          { width: 15 }, // ID
          { width: 15 }, // Nombre
          { width: 15 }, // Apellido
          { width: 15 }, // Monto
          { width: 12 }, // Estado
          { width: 15 }  // Fecha de Pago
        ];

        // Agregar hojas al workbook
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        XLSX.utils.book_append_sheet(wb, wsPagos, 'Detalle Pagos');

        // Generar nombre del archivo
        const fileName = `reporte-pagos-${reporte.metadata.generated_for.toLowerCase()}-${reporte.metadata.start_date.toISOString().split('T')[0]}-${reporte.metadata.end_date.toISOString().split('T')[0]}.xlsx`;

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

// Función para exportar reporte a PDF usando jsPDF con autoTable
export const exportarReportePDF = (reporte: FinancialReport): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(amount);

        // Función para determinar el estado del pago en PDF
        const getEstadoPagoPDF = (paidAt: Date | null) => {
          if (paidAt !== null) {
            return 'Pagado';
          }
          const ahora = new Date();
          if (ahora > reporte.metadata.end_date) {
            return 'Vencido';
          }
          return 'Pendiente';
        };

        // Encabezado con colores - verde oscuro rgb(26, 65, 52)
        pdf.setFillColor(26, 65, 52);
        pdf.rect(0, 0, 210, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('REPORTE FINANCIERO DE PAGOS', 105, 15, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text(reporte.metadata.generated_for.toUpperCase(), 105, 23, { align: 'center' });

        let currentY = 40;

        // Información del reporte
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Información del Reporte', 15, currentY);
        currentY += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const infoData = [
          ['Alcance:', reporte.metadata.generated_for],
          ['Fecha de Inicio:', reporte.metadata.start_date.toLocaleDateString('es-CO')],
          ['Fecha de Fin:', reporte.metadata.end_date.toLocaleDateString('es-CO')],
          ['Generado el:', reporte.metadata.generated_date.toLocaleString('es-CO')],
        ];

        autoTable(pdf, {
          startY: currentY,
          head: [],
          body: infoData,
          theme: 'plain',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { halign: 'left' }
          }
        });

        currentY = (pdf as any).lastAutoTable.finalY + 15;

        // Resumen financiero con tabla
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Resumen Financiero', 15, currentY);
        currentY += 8;

        const resumenData = [
          ['Total Ingresos', formatCurrency(reporte.financial_summary.incomes)],
          ['Total Pendiente', formatCurrency(reporte.financial_summary.pending)],
          ['Total Vencido', formatCurrency(reporte.financial_summary.overdue)],
          ['Miembros Cumplidos', reporte.members_ok.toString()],
          ['Miembros Atrasados', reporte.members_overdue.toString()],
          ['% Cumplimiento', `${reporte.percentage.toFixed(1)}%`],
        ];

        autoTable(pdf, {
          startY: currentY,
          head: [['Concepto', 'Valor']],
          body: resumenData,
          theme: 'striped',
          styles: { 
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [26, 65, 52],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right' }
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          }
        });

        currentY = (pdf as any).lastAutoTable.finalY + 15;

        // Detalle de pagos con tabla
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detalle de Pagos por Miembro', 15, currentY);
        currentY += 5;

        // Preparar datos de la tabla
        const pagosData = reporte.payments.map(pago => {
          const estado = getEstadoPagoPDF(pago.paid_at);
          const fechaPago = pago.paid_at ? pago.paid_at.toLocaleDateString('es-CO') : 'Sin pagos';
          return [
            `${pago.first_name} ${pago.last_name}`,
            formatCurrency(pago.amount),
            estado,
            fechaPago
          ];
        });

        autoTable(pdf, {
          startY: currentY,
          head: [['Nombre Completo', 'Monto', 'Estado', 'Fecha de Pago']],
          body: pagosData,
          theme: 'striped',
          styles: { 
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [26, 65, 52],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { halign: 'right', cellWidth: 40 },
            2: { halign: 'center', cellWidth: 30 },
            3: { halign: 'center', cellWidth: 50 }
          },
          didParseCell: function (data) {
            // Colorear las filas según el estado
            if (data.row.section === 'body' && data.column.index === 2) {
              const estado = data.cell.text[0];
              if (estado === 'Pagado') {
                data.cell.styles.fillColor = [220, 252, 231]; // verde claro
                data.cell.styles.textColor = [22, 163, 74]; // verde
              } else if (estado === 'Pendiente') {
                data.cell.styles.fillColor = [254, 249, 195]; // amarillo claro
                data.cell.styles.textColor = [202, 138, 4]; // amarillo
              } else {
                data.cell.styles.fillColor = [254, 226, 226]; // rojo claro
                data.cell.styles.textColor = [220, 38, 38]; // rojo
              }
            }
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          margin: { left: 15, right: 15 }
        });

        // Footer en todas las páginas
        const pageCount = (pdf as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(
            `Página ${i} de ${pageCount}`,
            105,
            285,
            { align: 'center' }
          );
          pdf.text(
            'Este reporte fue generado automáticamente por el sistema de gestión de scouts.',
            105,
            290,
            { align: 'center' }
          );
        }

        // Generar nombre del archivo
        const fileName = `reporte-pagos-${reporte.metadata.generated_for.toLowerCase()}-${reporte.metadata.start_date.toISOString().split('T')[0]}-${reporte.metadata.end_date.toISOString().split('T')[0]}.pdf`;

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


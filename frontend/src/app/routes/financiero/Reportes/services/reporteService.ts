import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FiltrosReporte, FinancialReport } from "@/types/reporte-financiero.type";
import api from "@/api/axios";

// Función para generar reporte desde el backend real
export const generarReporteReal = async (filtros: FiltrosReporte, tenantId: string): Promise<FinancialReport> => {
  try {
    const response = await api.post(`finanzas/reports/${tenantId}`, filtros);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte desde el backend:', error);
    throw error;
  }
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
          ['REPORTE DE PAGOS - ' + (reporte.scope?.toUpperCase() || 'GENERAL')],
          [''],
          ['Información del Reporte'],
          ['Alcance', reporte.scope || 'General'],
          ['Total Pagos', reporte.payments.length],
          [''],
          ['Periodo del Reporte'],
          ['Fecha de Inicio', reporte.start_date || 'N/A'],
          ['Fecha de Fin', reporte.end_date || 'N/A'],
          ['Generado el', new Date().toLocaleString('es-CO')],
          [''],
          ['Resumen Financiero'],
          ['Total Ingresos', reporte.financial_summary.income],
          ['Total Pendiente', reporte.financial_summary.pending],
          ['Total Vencido', reporte.financial_summary.overdue],
          [''],
          ['Resumen de Miembros'],
          ['Miembros Cumplidos', reporte.members_ok !== null ? reporte.members_ok : 'N/A'],
          ['Miembros Atrasados', reporte.members_overdue !== null ? reporte.members_overdue : 'N/A'],
          ['Total pagos', reporte.payments.length],
          ['% Cumplimiento', reporte.percentage !== null ? `${reporte.percentage.toFixed(1)}%` : 'N/A'],
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
        const getEstadoPago = (paidAt: string | null) => {
          if (paidAt !== null && paidAt !== "") {
            return 'Pagado';
          }
          // Verificar si está vencido comparando con la fecha de fin
          const ahora = new Date();
          if (ahora > new Date(reporte.end_date)) {
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
          pago.paid_at ? pago.paid_at : 'Sin pagos'
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
        const fileName = `reporte-pagos-${reporte.scope?.toLowerCase() || 'general'}-${reporte.start_date || 'na'}-${reporte.end_date || 'na'}.xlsx`;

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
        const getEstadoPagoPDF = (paidAt: string | null) => {
          if (paidAt !== null && paidAt !== "") {
            return 'Pagado';
          }
          const ahora = new Date();
          if (ahora > new Date(reporte.end_date)) {
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
        pdf.text(reporte.scope?.toUpperCase() || 'GENERAL', 105, 23, { align: 'center' });

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
          ['Alcance:', reporte.scope || 'General'],
          ['Fecha de Inicio:', reporte.start_date ? new Date(reporte.start_date).toLocaleDateString('es-CO') : 'N/A'],
          ['Fecha de Fin:', reporte.end_date ? new Date(reporte.end_date).toLocaleDateString('es-CO') : 'N/A'],
          ['Generado el:', new Date().toLocaleString('es-CO')],
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
          ['Total Ingresos', formatCurrency(reporte.financial_summary.income)],
          ['Total Pendiente', formatCurrency(reporte.financial_summary.pending)],
          ['Total Vencido', formatCurrency(reporte.financial_summary.overdue)],
          ['Miembros Cumplidos', reporte.members_ok !== null ? reporte.members_ok.toString() : 'N/A'],
          ['Miembros Atrasados', reporte.members_overdue !== null ? reporte.members_overdue.toString() : 'N/A'],
          ['% Cumplimiento', reporte.percentage !== null ? `${reporte.percentage.toFixed(1)}%` : 'N/A'],
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
          const fechaPago = pago.paid_at ? new Date(pago.paid_at).toLocaleDateString('es-CO') : 'Sin pagos';
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
        const fileName = `reporte-pagos-${reporte.scope?.toLowerCase() || 'general'}-${reporte.start_date || 'na'}-${reporte.end_date || 'na'}.pdf`;

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


import type { MedicalRecord } from "@/types/medical-record.type";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extender el tipo de jsPDF para incluir lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Función para formatear fechas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para verificar si hay contenido
const hasContent = (text: string) => text && text.trim().length > 0;

// Función para crear el PDF del registro médico
export const generateMedicalRecordPDF = async (record: MedicalRecord): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait"
      }) as jsPDFWithAutoTable;

      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Colores del branding
      const primaryColor: [number, number, number] = [26, 65, 52]; // #1a4134
      const primaryHover: [number, number, number] = [41, 118, 92]; // #29765c
      const secondaryColor: [number, number, number] = [145, 110, 90]; // #916e5a
      const textColor: [number, number, number] = [31, 41, 55];
      const mutedColor: [number, number, number] = [113, 113, 113]; // #717171
      const lightBg: [number, number, number] = [255, 250, 243]; // #fffaf3

      // Header con fondo primario
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 100, 'F');

      doc.setFillColor(...primaryHover);
      doc.rect(0, 80, pageWidth, 20, 'F');

      // Título principal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("REGISTRO MÉDICO", margin, 45);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(record.member_name, margin, 70);

      yPosition = 120;

      // Sección: Información Básica
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPosition, contentWidth, 25, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text("INFORMACIÓN BÁSICA", margin + 10, yPosition + 17);

      yPosition += 35;

      autoTable(doc, {
        startY: yPosition,
        head: [['Campo', 'Valor']],
        body: [
          ['Nombre Completo', record.member_name],
          ['Tipo de Sangre', record.blood_type],
          ['EPS', record.eps],
          ['Última Actualización', formatDate(record.updated_at)]
        ],
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 8,
          lineColor: [229, 231, 235],
          lineWidth: 0.5,
          textColor: textColor
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        theme: 'grid',
        tableWidth: 'auto'
      });

      yPosition = doc.lastAutoTable.finalY + 25;

      // Sección: Información Médica
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPosition, contentWidth, 25, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text("INFORMACIÓN MÉDICA DETALLADA", margin + 10, yPosition + 17);

      yPosition += 35;

      const medicalInfoBody = [
        ['Alergias', hasContent(record.allergies) ? record.allergies : 'Ninguna registrada'],
        ['Enfermedades Crónicas', hasContent(record.chronic_diseases) ? record.chronic_diseases : 'Ninguna registrada'],
        ['Restricciones Físicas', record.physical_restrictions || 'Ninguna registrada'],
        ['Antecedentes Quirúrgicos', record.surgical_history || 'Ninguno registrado']
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Descripción']],
        body: medicalInfoBody,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 8,
          lineColor: [229, 231, 235],
          lineWidth: 0.5,
          textColor: textColor
        },
        headStyles: {
          fillColor: primaryHover,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 140, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        theme: 'grid'
      });

      yPosition = doc.lastAutoTable.finalY + 25;

      // Sección: Vacunas
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPosition, contentWidth, 25, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(`VACUNAS (${record.vaccines_detail.length})`, margin + 10, yPosition + 17);

      yPosition += 35;

      if (record.vaccines_detail.length > 0) {
        const vaccinesBody = record.vaccines_detail.map(vaccine => [
          vaccine.name,
          formatDate(vaccine.applied_at)
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Vacuna', 'Fecha de Aplicación']],
          body: vaccinesBody,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 8,
            lineColor: [229, 231, 235],
            lineWidth: 0.5,
            textColor: textColor
          },
          headStyles: {
            fillColor: secondaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          theme: 'grid'
        });

        yPosition = doc.lastAutoTable.finalY + 25;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(...mutedColor);
        doc.text("No hay vacunas registradas en el sistema", margin, yPosition);
        yPosition += 35;
      }

      // Sección: Medicamentos
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPosition, contentWidth, 25, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(`MEDICAMENTOS (${record.medications_detail.length})`, margin + 10, yPosition + 17);

      yPosition += 35;

      if (record.medications_detail.length > 0) {
        const medicationsBody = record.medications_detail.map(med => [
          med.name,
          med.dose,
          med.frequency
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Medicamento', 'Dosis', 'Frecuencia']],
          body: medicationsBody,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 7,
            lineColor: [229, 231, 235],
            lineWidth: 0.5,
            textColor: textColor
          },
          headStyles: {
            fillColor: secondaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          theme: 'grid'
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(...mutedColor);
        doc.text("No hay medicamentos registrados en el sistema", margin, yPosition);
      }

      // Footer con línea decorativa
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(2);
      doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}`,
        margin,
        pageHeight - 25
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(
        "Scouts Platform",
        pageWidth - margin,
        pageHeight - 25,
        { align: 'right' }
      );

      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);

    } catch (error) {
      reject(error);
    }
  });
};

// Hook para usar la funcionalidad de PDF
export const useMedicalRecordPDF = () => {
  const exportToPDF = async (record: MedicalRecord): Promise<void> => {
    try {
      const pdfBlob = await generateMedicalRecordPDF(record);

      // Crear URL y descargar
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registro-medico-${record.member_name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el PDF');
    }
  };

  return { exportToPDF };
};
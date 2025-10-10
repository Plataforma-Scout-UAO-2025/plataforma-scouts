import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { OrganigramaNiveles } from "../types/niveles.types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================================
   📄 Exportación a PDF
   ============================================================ */
function exportPDF(data: OrganigramaNiveles) {
  const doc = new jsPDF();
  const title = `Organigrama de Niveles - ${data.anio}`;
  const fecha = new Date().toLocaleDateString("es-CO");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el ${fecha}`, 14, 27);

  const tableData: (string | number)[][] = [];

  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length === 0) {
      tableData.push([
        nivel.nombre,
        "—",
        "—",
        nivel.visible ? "Sí" : "No",
        "—",
        data.anio,
      ]);
    } else {
      nivel.cargos.forEach((cargo) => {
        tableData.push([
          nivel.nombre,
          cargo.nombre,
          cargo.titular || "—",
          nivel.visible ? "Sí" : "No",
          cargo.visible ? "Sí" : "No",
          data.anio,
        ]);
      });
    }
  });

  autoTable(doc, {
    head: [["Nivel", "Cargo", "Titular", "Visible (Nivel)", "Visible (Cargo)", "Año"]],
    body: tableData,
    startY: 35,
    theme: "striped",
    styles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      halign: "left",
    },
    headStyles: {
      fillColor: [26, 65, 52], // 🎨 --primary (#1a4134)
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [237, 237, 237] }, // 🎨 --accent (#EDEDED)
  });

  doc.save(`organigrama_niveles_${data.anio}.pdf`);
}

/* ============================================================
   📊 Exportación a CSV
   ============================================================ */
function exportCSV(data: OrganigramaNiveles) {
  const header = ["Nivel", "Cargo", "Titular", "Visible (Nivel)", "Visible (Cargo)", "Año"];
  const rows: string[][] = [];

  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length === 0) {
      rows.push([nivel.nombre, "—", "—", nivel.visible ? "Sí" : "No", "—", String(data.anio)]);
    } else {
      nivel.cargos.forEach((cargo) => {
        rows.push([
          nivel.nombre,
          cargo.nombre,
          cargo.titular || "—",
          nivel.visible ? "Sí" : "No",
          cargo.visible ? "Sí" : "No",
          String(data.anio),
        ]);
      });
    }
  });

  // Convertir a CSV con punto y coma (;) y BOM UTF-8
  const csvContent =
    [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(";")).join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `organigrama_niveles_${data.anio}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   📦 Componente ExportMenu
   ============================================================ */
export default function ExportMenu({ data }: { data: OrganigramaNiveles }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg px-4 py-2 flex items-center">
          <Download className="mr-2 h-4 w-4 text-primary-foreground" />
          Exportar organigrama
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border border-border bg-card text-foreground shadow-md rounded-lg"
      >
        <DropdownMenuItem
          onClick={() => exportPDF(data)}
          className="hover:bg-accent hover:text-primary transition-colors"
        >
          Exportar organigrama en PDF
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => exportCSV(data)}
          className="hover:bg-accent hover:text-primary transition-colors"
        >
          Exportar organigrama en CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

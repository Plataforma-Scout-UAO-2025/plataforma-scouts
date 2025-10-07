import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { OrganigramaNiveles } from "../types/niveles.types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Convierte los datos a CSV */
function toCSV(data: OrganigramaNiveles) {
  const rows: string[] = ["Nivel,Cargo,Titular,VisibleNivel,VisibleCargo,Año"];
  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length > 0) {
      nivel.cargos.forEach((cargo) => {
        rows.push(
          `${nivel.nombre.replaceAll(",", " ")},${cargo.nombre.replaceAll(",", " ")},${(cargo.titular || "").replaceAll(",", " ")},${nivel.visible},${cargo.visible},${data.anio}`
        );
      });
    } else {
      rows.push(`${nivel.nombre.replaceAll(",", " ")},,,${nivel.visible},,${data.anio}`);
    }
  });
  return rows.join("\n");
}

/** Genera el PDF visual con niveles y cargos */
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

  const tableData: any[] = [];

  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length === 0) {
      tableData.push([nivel.nombre, "-", "-", nivel.visible ? "Sí" : "No", "-", data.anio]);
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

  // 👇 uso correcto del plugin
  autoTable(doc, {
    head: [["Nivel", "Cargo", "Titular", "Nivel visible", "Cargo visible", "Año"]],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  doc.save(`organigrama_niveles_${data.anio}.pdf`);
}


/** Exporta CSV para Excel */
function exportCSV(data: OrganigramaNiveles) {
  const header = ["Nivel", "Cargo", "Titular", "Nivel visible", "Cargo visible", "Año"];
  const rows: string[][] = [];

  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length > 0) {
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
    } else {
      rows.push([nivel.nombre, "—", "—", nivel.visible ? "Sí" : "No", "—", String(data.anio)]);
    }
  });

  // 🔹 Convertir a texto CSV con punto y coma (;) y comillas
  const csvContent =
    [header, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(";"))
      .join("\r\n");

  // 🔹 Agregar BOM UTF-8 para compatibilidad con Excel
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


export default function ExportMenu({ data }: { data: OrganigramaNiveles }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-emerald-900 hover:bg-emerald-800">
          <Download className="mr-2 h-4 w-4" /> Exportar organigrama
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={() => exportPDF(data)}>
          Exportar organigrama en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportCSV(data)}>
          Exportar organigrama en Excel (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

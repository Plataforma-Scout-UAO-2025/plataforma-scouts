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
import { getMembersBySubgroup } from "@/api/organigramaApi";
type NameLike = {
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
};

/* ============================================================
   📄 Exportación a PDF
   ============================================================ */
async function exportPDF(data: OrganigramaNiveles) {
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
  const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = (s: string) => stripAccents(String(s || "")).toLowerCase().trim();
  const JEFATURA_ORDER = [
    "Jefe de Región",
    "Sub Jefe de Región",
    "Jefe de Grupo",
    "Sub Jefe de Grupo",
    "Jefe de Rama",
    "Sub Jefe de Subrama",
  ].map(normalize);
  const PADRES_ORDER = [
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Vocal",
  ].map(normalize);

  for (const nivel of data.niveles) {
    if (nivel.cargos.length === 0) {
      tableData.push([
        nivel.nombre,
        "—",
        "—",
        "—", // Periodo (Año)
        nivel.descripcion || "—", // Descripción
      ]);
    } else {
      const nName = normalize(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER : isPad ? PADRES_ORDER : null;
      const sorted = [...nivel.cargos].sort((a, b) => {
        if (priority) {
          const ai = priority.indexOf(normalize(a.nombre));
          const bi = priority.indexOf(normalize(b.nombre));
          const aIn = ai !== -1; const bIn = bi !== -1;
          if (aIn && bIn) return ai - bi;
          if (aIn) return -1; if (bIn) return 1;
          return a.nombre.localeCompare(b.nombre, 'es');
        }
        return a.nombre.localeCompare(b.nombre, 'es');
      });
      for (const cargo of sorted) {
        const periodo = cargo.inicio && cargo.fin ? `${cargo.inicio}-${cargo.fin}` : "—";
        let titulares = cargo.titular || "";
        // Intentar rellenar titulares con miembros del subgrupo (cargo.id)
        const cargoId = Number(cargo.id);
        if (!Number.isNaN(cargoId)) {
          try {
            const miembros = await getMembersBySubgroup(cargoId);
            if (Array.isArray(miembros) && miembros.length > 0) {
              titulares = miembros
                .map((m: NameLike) => `${m.firstName || m.first_name || ''} ${m.lastName || m.last_name || ''}`.trim())
                .filter(Boolean)
                .join(', ');
            }
          } catch (error) {
            console.warn("[Export PDF Niveles] No se pudieron obtener los miembros del subgrupo", cargoId, error);
          }
        }

        tableData.push([
          nivel.nombre,
          cargo.nombre,
          titulares || "—",
          periodo, // Periodo (Año)
          cargo.descripcion || "—", // Descripción
        ]);
      }
    }
  }

  autoTable(doc, {
    head: [
      ["Nivel", "Cargo", "Titular", "Periodo", "Descripción"], // Columnas requeridas
    ],
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
  const header = ["Nivel", "Cargo", "Titular", "Periodo", "Descripción"];
  const rows: string[][] = [];
  const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalize = (s: string) => stripAccents(String(s || "")).toLowerCase().trim();
  const JEFATURA_ORDER = [
    "Jefe de Región",
    "Sub Jefe de Región",
    "Jefe de Grupo",
    "Sub Jefe de Grupo",
    "Jefe de Rama",
    "Sub Jefe de Subrama",
  ].map(normalize);
  const PADRES_ORDER = [
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Vocal",
  ].map(normalize);

  data.niveles.forEach((nivel) => {
    if (nivel.cargos.length === 0) {
      rows.push([nivel.nombre, "—", "—", String(data.anio), nivel.descripcion || "—"]);
    } else {
      const nName = normalize(nivel.nombre);
      const isJef = nName.includes("comite de jefatura");
      const isPad = nName.includes("comite de padres");
      const priority = isJef ? JEFATURA_ORDER : isPad ? PADRES_ORDER : null;
      const sorted = [...nivel.cargos].sort((a, b) => {
        if (priority) {
          const ai = priority.indexOf(normalize(a.nombre));
          const bi = priority.indexOf(normalize(b.nombre));
          const aIn = ai !== -1; const bIn = bi !== -1;
          if (aIn && bIn) return ai - bi;
          if (aIn) return -1; if (bIn) return 1;
          return a.nombre.localeCompare(b.nombre, 'es');
        }
        return a.nombre.localeCompare(b.nombre, 'es');
      });
      sorted.forEach((cargo) => {
        const periodo = cargo.inicio && cargo.fin ? `${cargo.inicio}-${cargo.fin}` : "—";
        rows.push([
          nivel.nombre,
          cargo.nombre,
          cargo.titular || "—",
          periodo, // Periodo (Año)
          cargo.descripcion || "—", // Descripción
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

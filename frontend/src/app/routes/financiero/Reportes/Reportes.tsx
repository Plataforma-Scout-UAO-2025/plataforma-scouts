import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReporteModal from "./components/ReporteModal";
import ReporteView from "./components/ReporteView";
import { type ReportePagos, type FiltrosReporte } from "./types/reporte.type";
import { generarReporteMock, exportarReportePDF, exportarReporteExcel } from "./services/reporteService";

export default function Reportes() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reporteActual, setReporteActual] = useState<ReportePagos | null>(null);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);

  // Detectar si hay parámetros de reporte en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const grupoId = urlParams.get('grupoId');
    const fechaInicio = urlParams.get('fechaInicio');
    const fechaFin = urlParams.get('fechaFin');
    
    if (grupoId && fechaInicio && fechaFin) {
      // Generar reporte automáticamente con los parámetros de la URL
      const filtros: FiltrosReporte = {
        grupoId,
        fechaInicio,
        fechaFin
      };
      
      handleGenerarReporte(filtros);
      
      // Limpiar los parámetros de la URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleGenerarReporte = async (filtros: FiltrosReporte) => {
    setCargandoReporte(true);
    try {
      const reporte = await generarReporteMock(filtros);
      setReporteActual(reporte);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setCargandoReporte(false);
    }
  };

  const handleExportarPDF = async () => {
    if (!reporteActual) return;
    
    setExportandoPDF(true);
    try {
      await exportarReportePDF(reporteActual);
      toast.success("Reporte exportado a PDF exitosamente");
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast.error("Error al exportar el reporte a PDF");
    } finally {
      setExportandoPDF(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!reporteActual) return;
    
    setExportandoExcel(true);
    try {
      await exportarReporteExcel(reporteActual);
      toast.success("Reporte exportado a Excel exitosamente");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("Error al exportar el reporte a Excel");
    } finally {
      setExportandoExcel(false);
    }
  };

  const handleNuevoReporte = () => {
    setReporteActual(null);
    setModalAbierto(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            Reportes Financieros
          </h1>
          <p className="text-muted-foreground">
            Genera reportes financieros del grupo
          </p>
        </div>
        {reporteActual && (
          <Button onClick={handleNuevoReporte} variant="outline">
            Nuevo Reporte
          </Button>
        )}
      </div>

      {cargandoReporte && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Generando reporte...</span>
          </div>
        </div>
      )}

      {!reporteActual && !cargandoReporte && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="primary" 
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2"
          >
            <FileText className="text-white" />
            Reporte Consolidado Financiero
          </Button>
        </div>
      )}

      {reporteActual && !cargandoReporte && (
        <ReporteView 
          reporte={reporteActual} 
          onExportarPDF={exportandoPDF ? undefined : handleExportarPDF}
          onExportarExcel={exportandoExcel ? undefined : handleExportarExcel}
        />
      )}

      <ReporteModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        onGenerarReporte={handleGenerarReporte}
      />
    </div>
  );
}

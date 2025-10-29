import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui";
import { Download, Users, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { exportarReporteExcel, exportarReportePDF, generarReporteReal } from "../services/reporteService";
import type { FinancialReport, FiltrosReporte } from "@/types/reporte-financiero.type";

// sin props; este componente lee parámetros desde la URL y carga el reporte

const getEstadoColor = (estado: "PAID" | "PENDING" | "OVERDUE"): string => {
  switch (estado) {
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "OVERDUE":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getEstadoIcon = (estado: "PAID" | "PENDING" | "OVERDUE") => {
  switch (estado) {
    case "PAID":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "OVERDUE":
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
};

const getEstadoTexto = (estado: "PAID" | "PENDING" | "OVERDUE"): string => {
  switch (estado) {
    case "PAID":
      return "Pagado";
    case "PENDING":
      return "Pendiente";
    case "OVERDUE":
      return "Vencido";
  }
};

const getEstadoDelPago = (paidAt: string | null, endDate: Date): "PAID" | "PENDING" | "OVERDUE" => {
  if (paidAt !== null && paidAt !== "") {
    return "PAID";
  }
  
  // Si no está pagado y la fecha de fin ya pasó, está vencido
  const ahora = new Date();
  if (ahora > endDate) {
    return "OVERDUE";
  }
  
  return "PENDING";
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ReporteView() {
  const tenantId = useTenant();
  const [reporte, setReporte] = useState<FinancialReport | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [exportandoPDF, setExportandoPDF] = useState<boolean>(false);
  const [exportandoExcel, setExportandoExcel] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scope = urlParams.get("scope");
    const associatedToId = urlParams.get("associatedToId");
    const start_date = urlParams.get("start_date") || urlParams.get("fechaInicio");
    const end_date = urlParams.get("end_date") || urlParams.get("fechaFin");

    if (!scope || !start_date || !end_date) {
      setError("Parámetros de reporte inválidos o faltantes");
      return;
    }

    if (!tenantId) {
      setError("No se pudo obtener el ID del grupo");
      return;
    }

    const filtros: FiltrosReporte = {
      id: associatedToId || "",
      generated_for: scope === "SCOUT" ? "MEMBER" : scope === "SUBGROUP" ? "SUBGROUP" : "SECTION",
      start_date,
      end_date,
    };

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await generarReporteReal(filtros, tenantId);
        setReporte(data);
      } catch (e) {
        console.error(e);
        setError("Error al generar el reporte");
        toast.error("Error al generar el reporte");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [tenantId]);

  const fechaInicio = reporte?.start_date ? format(new Date(reporte.start_date), "dd/MM/yyyy", { locale: es }) : "N/A";
  const fechaFin = reporte?.end_date ? format(new Date(reporte.end_date), "dd/MM/yyyy", { locale: es }) : "N/A";
  const fechaGeneracion = format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es });

  const handleExportarPDF = async () => {
    if (!reporte) return;
    setExportandoPDF(true);
    try {
      await exportarReportePDF(reporte);
      toast.success("Reporte exportado a PDF exitosamente");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar el reporte a PDF");
    } finally {
      setExportandoPDF(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!reporte) return;
    setExportandoExcel(true);
    try {
      await exportarReporteExcel(reporte);
      toast.success("Reporte exportado a Excel exitosamente");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar el reporte a Excel");
    } finally {
      setExportandoExcel(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (cargando || !reporte) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Download className="h-6 w-6 animate-spin" />
          <span className="text-lg">Generando reporte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Reporte */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Periodo: {fechaInicio} - {fechaFin}
          </p>
          <p className="text-sm text-muted-foreground">
            Generado el {fechaGeneracion}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportarExcel}
            disabled={exportandoExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button 
            onClick={handleExportarPDF}
            disabled={exportandoPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reporte.financial_summary.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(reporte.financial_summary.pending)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reporte.financial_summary.overdue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Cumplimiento</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reporte.percentage !== null ? `${reporte.percentage.toFixed(1)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {reporte.members_ok !== null && reporte.members_overdue !== null 
                ? `${reporte.members_ok} de ${reporte.members_overdue} miembros`
                : "Información no disponible"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Pagos </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reporte.payments.map((payment) => {
              const estado = getEstadoDelPago(payment.paid_at, new Date(reporte.end_date));
              return (
                <div key={payment.payment_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {(payment.first_name || 'N').charAt(0)}{(payment.last_name || 'N').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{payment.first_name || 'N/A'} {payment.last_name || 'N/A'}</p>
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(estado)}
                        <Badge className={getEstadoColor(estado)}>
                          {getEstadoTexto(estado)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.paid_at ? (
                        `Último pago: ${format(new Date(payment.paid_at), "dd/MM/yyyy", { locale: es })}`
                      ) : (
                        "Sin pagos registrados"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-sm text-muted-foreground">
        <p>Este reporte fue generado automáticamente por el sistema de gestión de scouts.</p>
        <p>Para más información, contacta al administrador del sistema.</p>
      </div>
    </div>
  );
}

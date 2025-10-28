import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui";
import { Download, Users, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoPago, ReportePagos } from "../types/reporte.type";

interface ReporteViewProps {
  reporte: ReportePagos;
  onExportarPDF?: () => void;
  onExportarExcel?: () => void;
}

const getEstadoColor = (estado: EstadoPago): string => {
  switch (estado) {
    case "pagado":
      return "bg-green-100 text-green-800 border-green-200";
    case "pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "vencido":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getEstadoIcon = (estado: EstadoPago) => {
  switch (estado) {
    case "pagado":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "pendiente":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "vencido":
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ReporteView({ reporte, onExportarPDF, onExportarExcel }: ReporteViewProps) {
  const fechaInicio = format(new Date(reporte.fechaInicio), "dd/MM/yyyy", { locale: es });
  const fechaFin = format(new Date(reporte.fechaFin), "dd/MM/yyyy", { locale: es });
  const fechaGeneracion = format(new Date(reporte.generadoEn), "dd/MM/yyyy 'a las' HH:mm", { locale: es });

  return (
    <div className="space-y-6">
      {/* Header del Reporte */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">
            Reporte de Pagos - {reporte.grupo.nombre}
          </h2>
          <p className="text-muted-foreground">
            Periodo: {fechaInicio} - {fechaFin}
          </p>
          <p className="text-sm text-muted-foreground">
            Generado el {fechaGeneracion}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onExportarExcel} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button 
            onClick={onExportarPDF} 
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
              {formatCurrency(reporte.resumen.totalIngresos)}
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
              {formatCurrency(reporte.resumen.totalPendiente)}
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
              {formatCurrency(reporte.resumen.totalVencido)}
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
              {reporte.resumen.porcentajeCumplimiento.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {reporte.resumen.miembrosCumplidos} de {reporte.resumen.totalMiembros} miembros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información del Grupo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Nombre del Grupo</p>
              <p className="text-sm text-muted-foreground">{reporte.grupo.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Rango de Edad</p>
              <p className="text-sm text-muted-foreground">
                {reporte.grupo.edadMinima} - {reporte.grupo.edadMaxima} años
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Miembros Activos</p>
              <p className="text-sm text-muted-foreground">{reporte.grupo.miembrosActivos}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Miembros Atrasados</p>
              <p className="text-sm text-muted-foreground">{reporte.resumen.miembrosAtrasados}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Pagos por Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reporte.miembros.map((miembro) => (
              <div key={miembro.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {miembro.nombre.charAt(0)}{miembro.apellido.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{miembro.nombre} {miembro.apellido}</p>
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(miembro.estado)}
                      <Badge className={getEstadoColor(miembro.estado)}>
                        {miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1)}
                      </Badge>
                      {miembro.estado === "vencido" && miembro.diasVencido && (
                        <span className="text-xs text-red-600">
                          ({miembro.diasVencido} días vencido)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(miembro.montoPagado)} / {formatCurrency(miembro.montoTotal)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {miembro.fechaUltimoPago ? (
                      `Último pago: ${format(new Date(miembro.fechaUltimoPago), "dd/MM/yyyy", { locale: es })}`
                    ) : (
                      "Sin pagos registrados"
                    )}
                  </p>
                </div>
              </div>
            ))}
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

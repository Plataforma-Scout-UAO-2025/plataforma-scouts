import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User
} from "lucide-react";
import type { Hijo, EstadoCuentaData } from "../types/estadoCuenta.type";

interface ResumenEstadoCuentaProps {
  hijo: Hijo;
  estadoCuenta: EstadoCuentaData;
}

export default function ResumenEstadoCuenta({ hijo, estadoCuenta }: ResumenEstadoCuentaProps) {
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(monto);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Información del Hijo */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">{hijo.nombre}</h2>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Rama: {hijo.rama}</span>
              <span>•</span>
              <span>Edad: {hijo.edad} años</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pendiente */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pendiente</p>
              <p className="text-2xl font-bold text-red-600">
                {formatMonto(estadoCuenta.resumen.totalPendiente)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Total Pagado */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatMonto(estadoCuenta.resumen.totalPagado)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Cuotas Vencidas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cuotas Vencidas</p>
              <p className="text-2xl font-bold text-orange-600">
                {estadoCuenta.resumen.cuotasVencidas}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Próximo Vencimiento */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Próximo Vencimiento</p>
              <p className="text-sm font-semibold text-blue-600">
                {estadoCuenta.resumen.proximoVencimiento 
                  ? formatFecha(estadoCuenta.resumen.proximoVencimiento)
                  : "No hay cuotas pendientes"
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas */}
      {estadoCuenta.resumen.cuotasVencidas > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">
                Tienes {estadoCuenta.resumen.cuotasVencidas} cuota(s) vencida(s)
              </p>
              <p className="text-sm text-orange-600">
                Te recomendamos ponerte al día lo antes posible para evitar inconvenientes.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


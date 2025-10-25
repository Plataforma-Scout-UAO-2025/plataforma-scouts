import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, BarChart3, CalendarDays, CircleDollarSign, TrendingDown, AlertTriangle } from "lucide-react";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useTenant } from "@/hooks/useTenant";
import api from "@/api/axios";
import type { DashboardFinanciero } from "@/types/dashboard-tesorero.types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ComiteAdminView = () => {
  const { currentUserRoleLabel } = useRoleContext();
  const tenantId = useTenant();
  const [data, setData] = useState<DashboardFinanciero | null>(null);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  async function getDashboardData(id: string) {
    try {
      const response = await api.get("finanzas/dashboard/" + id);
      setData(response.data);
    } catch (error: any) {
      // Comité tiene acceso de solo lectura; puede que backend restrinja algunos detalles
      if (error?.response?.status === 403) {
        toast.info("Sin permisos para ver algunos indicadores financieros");
      } else {
        toast.error("No se pudo cargar el resumen financiero");
      }
    }
  }

  useEffect(() => {
    if (tenantId) {
      getDashboardData(tenantId);
    }
  }, [tenantId]);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          ¡Bienvenido, {currentUserRoleLabel || "Comité"}!
        </h1>
        <p className="text-muted-foreground mt-2">Herramientas y métricas para la gestión del comité</p>
      </div>

      {/* Resumen financiero (solo lectura) + Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Resumen financiero (solo lectura)
            </CardTitle>
            <CardDescription>Totales y vencidos del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="border rounded-xl shadow-sm p-4 flex items-center flex-1">
                <div className="w-full">
                  <div className="pb-2 flex justify-between items-center">
                    <p className="text-sm">Total recaudado</p>
                    <CircleDollarSign className="text-green-600 w-6 h-6" />
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data?.kpis.total_recaudado || 0)}</p>
                </div>
              </div>
              <div className="border rounded-xl shadow-sm p-4 flex items-center flex-1">
                <div className="w-full">
                  <div className="pb-2 flex justify-between items-center">
                    <p className="text-sm">Total deuda</p>
                    <TrendingDown className="text-yellow-600 w-6 h-6" />
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(data?.kpis.total_pendiente || 0)}</p>
                </div>
              </div>
              <div className="border rounded-xl shadow-sm p-4 flex items-center flex-1">
                <div className="w-full">
                  <div className="pb-2 flex justify-between items-center">
                    <p className="text-sm">Pagos vencidos</p>
                    <AlertTriangle className="text-red-600 w-6 h-6" />
                  </div>
                  <p className="text-xl font-bold">{data?.kpis.pagos_vencidos || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Para más detalle, consulta Pagos y Cuotas.</div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" />
              Acciones rápidas
            </CardTitle>
            <CardDescription>Atajos frecuentes del comité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link to="/app/financiero/pagos">Ver pagos</Link></Button>
              <Button asChild variant="outline"><Link to="/app/financiero/gestion">Ver cuotas</Link></Button>
              <Button asChild variant="outline" disabled title="Próximamente"><Link to="#">Autorizaciones</Link></Button>
              <Button asChild variant="outline" disabled title="Próximamente"><Link to="#">Eventos</Link></Button>
            </div>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 mt-3">
              <li className="flex items-center gap-1"><CalendarDays className="size-4" /> Calendario y logística: en preparación</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComiteAdminView;

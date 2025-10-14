import { Card } from "@/components/ui/card";
import { CreditCard, AlertTriangle, CheckCircle, User } from "lucide-react";
import type { Member } from "@/types/estado-cuenta.type";

interface ResumenEstadoCuentaProps {
  kpis: {
    total_pendiente: number;
    total_pagado: number;
    cuotas_vencidas: number;
  };
  member?: Member | null;
}

export default function ResumenEstadoCuenta({
  kpis,
  member,
}: ResumenEstadoCuentaProps) {
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(monto);
  };

  return (
    <div className="space-y-6">
      {/* Información del Hijo (solo para acudiente) */}
      {member && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">
                {member.member_name}
              </h2>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Sección: {member.section.name}</span>
                <span>•</span>
                <span>Subgrupo: {member.subgroup.name}</span>

                {member.age ? (
                  <>
                    <span>•</span>
                    <span>Edad: {member.age} años</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Pendiente */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Pendiente este mes
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatMonto(kpis.total_pendiente)}
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
              <p className="text-sm font-medium text-muted-foreground">
                Total Pagado
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatMonto(kpis.total_pagado)}
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
              <p className="text-sm font-medium text-muted-foreground">
                Cuotas Vencidas
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {kpis.cuotas_vencidas}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas */}
      {kpis.cuotas_vencidas > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">
                {member ? "Tienes" : "Hay"} {kpis.cuotas_vencidas} cuota(s)
                vencida(s)
              </p>
              <p className="text-sm text-orange-600">
                {member
                  ? "Te recomendamos ponerte al día lo antes posible para evitar inconvenientes."
                  : "Se recomienda gestionar los pagos atrasados lo antes posible."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

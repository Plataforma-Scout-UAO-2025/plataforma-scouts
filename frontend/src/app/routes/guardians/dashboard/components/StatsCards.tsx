//import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  data: {
    miembrosACargo: number;
    valorPendiente: number;
    cuotasPendientes: number;
  };
}

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};

export default function StatsCards({ data }: StatsCardsProps) {
  const estadisticas = [
    {
      icon: Users,
      titulo: "Miembros a Cargo",
      valor: data.miembrosACargo.toString(),
      detalle: "Total de miembros",
      color: "text-blue-600",
    },
    {
      icon: DollarSign,
      titulo: "Valor Pendiente",
      valor: formatearMoneda(data.valorPendiente),
      detalle: "Saldo por pagar",
      color: "text-red-600",
    },
    {
      icon: AlertTriangle,
      titulo: "Cuotas Pendientes",
      valor: data.cuotasPendientes.toString(),
      detalle: "Cuotas por pagar",
      color: "text-amber-600",
    }
  ];


  return (
    <div className="mx-4">
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {estadisticas.map((stat, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-sm p-6"
            >
              <div className="mb-6">
                <p className="text-xl font-bold text-text">{stat.titulo}</p>
                <p className="text-accent-foreground text-sm">
                  {stat.detalle}
                </p>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/60 transition-colors">
                <div className={`p-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-text">{stat.valor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
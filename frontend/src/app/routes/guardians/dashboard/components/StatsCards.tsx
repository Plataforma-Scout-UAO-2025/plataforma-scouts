import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-blue-500 hover:scale-101 transition-all duration-300 ease-in-out">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Miembros a Cargo</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {data.miembrosACargo}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de miembros
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-red-500 hover:scale-101 transition-all duration-300 ease-in-out">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Pendiente</CardTitle>
          <DollarSign className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatearMoneda(data.valorPendiente)}
          </div>
          <p className="text-xs text-muted-foreground">
            Saldo por pagar
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-orange-600 hover:scale-101 transition-all duration-300 ease-in-out">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cuotas Pendientes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {data.cuotasPendientes}
          </div>
          <p className="text-xs text-muted-foreground">
            Cuotas por pagar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

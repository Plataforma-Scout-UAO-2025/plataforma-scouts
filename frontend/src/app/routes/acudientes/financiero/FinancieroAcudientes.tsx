import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen, DollarSign, Calendar, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '../components/Sidebar';

// Datos de ejemplo para cuotas del acudiente
const cuotasEjemplo = [
  {
    id: 1,
    concepto: "Cuota Mensual - Octubre 2025",
    monto: 85000,
    fechaVencimiento: "2025-10-31",
    estado: "pendiente",
    fechaPago: null,
    miembro: "José Alberto Gutierrez Jimenez"
  },
  {
    id: 2,
    concepto: "Cuota Mensual - Septiembre 2025",
    monto: 85000,
    fechaVencimiento: "2025-09-30",
    estado: "pagado",
    fechaPago: "2025-09-28",
    miembro: "José Alberto Gutierrez Jimenez"
  },
  {
    id: 3,
    concepto: "Actividad Especial - Campamento",
    monto: 150000,
    fechaVencimiento: "2025-11-15",
    estado: "pendiente",
    fechaPago: null,
    miembro: "Ana María López Hernández"
  },
  {
    id: 4,
    concepto: "Cuota Mensual - Octubre 2025",
    monto: 85000,
    fechaVencimiento: "2025-10-31",
    estado: "vencido",
    fechaPago: null,
    miembro: "Ana María López Hernández"
  }
];

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(monto);
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case 'pagado':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>;
    case 'pendiente':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
    case 'vencido':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>;
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
};

export default function FinancieroAcudientes() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const cuotasPendientes = cuotasEjemplo.filter(c => c.estado === 'pendiente' || c.estado === 'vencido');
  const totalPendiente = cuotasPendientes.reduce((sum, cuota) => sum + cuota.monto, 0);
  const cuotasVencidas = cuotasEjemplo.filter(c => c.estado === 'vencido').length;

  const handleGoBack = () => {
    window.history.back();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-[#fffaf3]">
      {/* Sidebar - Condicionalmente visible con transición */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-72' : 'w-0'} overflow-hidden`}>
        <Sidebar activeRoute="financiero" />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra "Área de trabajo" */}
        <div className="h-16 bg-[#fffaf3] border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              title={isSidebarVisible ? "Ocultar sidebar" : "Mostrar sidebar"}
            >
              <FolderOpen className="h-5 w-5 text-[#1a4134]" />
            </Button>
            <span className="text-lg font-medium text-[#1a4134]">Área de trabajo</span>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Botón volver */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-[#1a4134] hover:bg-[#1a4134]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
            </div>

            {/* Header de la vista */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1a4134] mb-3 flex items-center">
                <DollarSign className="h-8 w-8 mr-3" />
                Estado Financiero
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                Consulta el estado de cuotas y pagos de los miembros a tu cargo. 
                Mantente al día con los compromisos financieros del grupo scout.
              </p>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatearMoneda(totalPendiente)}</div>
                  <p className="text-xs text-muted-foreground">
                    {cuotasPendientes.length} cuotas pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cuotas Vencidas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{cuotasVencidas}</div>
                  <p className="text-xs text-muted-foreground">
                    Requieren atención inmediata
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Historial</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{cuotasEjemplo.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de registros
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de cuotas */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cuotas</CardTitle>
                <CardDescription>
                  Estado detallado de cuotas y pagos de los miembros a tu cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cuotasEjemplo.map((cuota) => (
                    <div
                      key={cuota.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{cuota.concepto}</h3>
                          {getEstadoBadge(cuota.estado)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Miembro:</strong> {cuota.miembro}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <strong>Vencimiento:</strong> {formatearFecha(cuota.fechaVencimiento)}
                          </span>
                          {cuota.fechaPago && (
                            <span>
                              <strong>Pagado:</strong> {formatearFecha(cuota.fechaPago)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1a4134]">
                          {formatearMoneda(cuota.monto)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
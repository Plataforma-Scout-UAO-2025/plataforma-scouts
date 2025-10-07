import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Calendar, DollarSign, Bell, Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';

export default function AcudienteDashboard() {
  const navigate = useNavigate();

  // Datos de ejemplo para el dashboard
  const dashboardData = {
    miembrosACargo: 3,
    activosThisMes: 2,
    proximosEventos: 2,
    cuotasPendientes: 2,
    totalPendiente: 170000
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const quickActions = [
    {
      title: "Ver Miembros a Cargo",
      description: "Gestiona la información de tus miembros",
      icon: Users,
      action: () => navigate('/guardians/members'),
      color: "bg-blue-500"
    },
    {
      title: "Mi Perfil",
      description: "Actualiza tu información personal",
      icon: Settings,
      action: () => navigate('/guardians/profile'),
      color: "bg-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Sidebar activeRoute="inicio" />
      
      <div className="ml-72 p-6 space-y-6">
        {/* Header de bienvenida */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#1a4134]">¡Bienvenido, Juan Esteban!</h1>
          <p className="text-gray-600">MANADA KUNA - Panel de Acudiente</p>
        </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros a Cargo</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.miembrosACargo}
            </div>
            <p className="text-xs text-gray-600">
              Total de miembros
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Este Mes</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.activosThisMes}
            </div>
            <p className="text-xs text-gray-600">
              Participando en actividades
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.proximosEventos}
            </div>
            <p className="text-xs text-gray-600">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuotas Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatearMoneda(dashboardData.totalPendiente)}
            </div>
            <p className="text-xs text-gray-600">
              {dashboardData.cuotasPendientes} cuotas pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notificaciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1a4134]" />
            Notificaciones Recientes
          </CardTitle>
          <CardDescription>
            Mantente al día con las últimas actualizaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nuevo evento disponible</p>
                <p className="text-xs text-gray-600">Campamento de Otoño - Inscripciones abiertas hasta el 10 de octubre</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Recordatorio de pago</p>
                <p className="text-xs text-gray-600">Cuota mensual de octubre vence el 31 de octubre</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Actividad completada</p>
                <p className="text-xs text-gray-600">José Alberto participó en la actividad de servicio comunitario</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
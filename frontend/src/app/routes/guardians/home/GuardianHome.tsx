import StatsCards from './components/StatsCards';
import QuickActions from './components/QuickActions';
import RecentNotifications from './components/RecentNotifications';

export default function GuardianHome() {
  // Datos de ejemplo para el dashboard
  const dashboardData = {
    miembrosACargo: 3,
    activosThisMes: 2,
    proximosEventos: 2,
    cuotasPendientes: 2,
    totalPendiente: 170000
  };

  return (
    <div className="space-y-6">
      {/* Header de bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido, Juan Esteban!</h1>
          <p className="text-muted-foreground">
            MANADA KUNA - Panel de Acudiente
          </p>
        </div>
      </div>

      {/* Cards de resumen */}
      <StatsCards data={dashboardData} />

      {/* Acciones rápidas */}
      <QuickActions />

      {/* Notificaciones recientes */}
      <RecentNotifications />
    </div>
  );
}

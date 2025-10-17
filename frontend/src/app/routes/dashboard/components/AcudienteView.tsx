import { useAuth0 } from "@auth0/auth0-react";
import StatsCards from '@/app/routes/guardians/dashboard/components/StatsCards';
import QuickActions from '@/app/routes/guardians/dashboard/components/QuickActions';
import RecentNotifications from '@/app/routes/guardians/dashboard/components/RecentNotifications';

export default function AcudienteView() {
  const { user } = useAuth0();
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
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido, {user?.nickname || user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Panel de Acudiente
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

import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import StatsCards from '@/app/routes/guardians/dashboard/components/StatsCards';
import QuickActions from '@/app/routes/guardians/dashboard/components/QuickActions';

export default function AcudienteView() {
  const { user } = useAuth0();
  const [error] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header de bienvenida */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Bienvenido, {user?.nickname || user?.name}!
        </h1>
        <p className="text-muted-foreground">Panel de Acudiente</p>
      </div>
      {/* Mostrar error si existe */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Cards de resumen */}
      <div className="flex justify-center">
        <StatsCards />
      </div>

      {/* Acciones rápidas */}
      <QuickActions />
    </div>
  );
}

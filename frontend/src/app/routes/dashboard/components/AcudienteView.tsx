import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import api from "@/api/axios";
import StatsCards from '@/app/routes/guardians/dashboard/components/StatsCards';
import QuickActions from '@/app/routes/guardians/dashboard/components/QuickActions';
import PendingApprovalModal from "@/app/routes/admin-grupal/Miembros/components/PendingApprovalModal";
import InactiveMemberModal from "@/app/routes/admin-grupal/Miembros/components/InactiveMemberModal";

export default function AcudienteView() {
  const { user } = useAuth0();
  const tenantId = useTenant();
  const acudienteId = 83;
  const [error, setError] = useState<string | null>(null);

  // Hook personalizado para validar acceso del miembro
  const { hasAccess, reason, loading: accessLoading } = useMemberAccess();

  // Datos de ejemplo para el dashboard
  const [dashboardData, setDashboardData] = useState({
    miembrosACargo: 0,
    valorPendiente: 0,
    cuotasPendientes: 0,
  });

    useEffect(() => {
    async function fetchEstadoCuenta() {
      try {
        setError(null);
        const res = await api.get(`/finanzas/payments/status/${tenantId}/${acudienteId}`);
        setDashboardData((prev) => ({
          ...prev,
          miembrosACargo: res.data.members?.length ?? 0,
          valorPendiente: res.data.kpis.total_pendiente ?? 0,
          cuotasPendientes: res.data.kpis.cuotas_vencidas ?? 0,
        }));
      } catch (error) {
        setError(
          "No se pudo cargar el estado de cuenta. Intenta nuevamente más tarde: " +
          (error instanceof Error ? error.message : String(error))
        );
      }
    };
    if (tenantId) fetchEstadoCuenta();
  }, [tenantId]);

  // Mostrar loader mientras se valida el acceso
  if (accessLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        Cargando información...
      </div>
    );
  }

  // Mostrar modal de solicitud pendiente
  if (reason === "pending") {
    return <PendingApprovalModal isOpen={true} />;
  }

  // Mostrar modal de miembro inactivo
  if (reason === "inactive") {
    return <InactiveMemberModal isOpen={true} />;
  }

  // Si no tiene acceso por cualquier otra razón
  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        No tienes acceso al sistema. Por favor contacta a los administradores.
      </div>
    );
  }

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
      {/* Mostrar error si existe */}
      {error && (
        <div style={{ color: "red" }}>{error}</div>
      )}

      {/* Cards de resumen */}
      <StatsCards data={dashboardData} />

      {/* Acciones rápidas */}
      <QuickActions />

    </div>
  );
}

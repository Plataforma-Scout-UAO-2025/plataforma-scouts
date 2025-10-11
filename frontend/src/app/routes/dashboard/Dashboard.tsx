import { useRoleContext } from "@/hooks/useRoleContext";
import { RawRole } from "@/roles/roles";
import AdminGlobalView from "./components/AdminGlobalView";
import AdminGrupoView from "./components/AdminGrupoView";
import AcudienteView from "./components/AcudienteView";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function Dashboard() {
  const { currentUserRole, status } = useRoleContext();

  if (status === "loading" || status === "idle") {
    return <FullScreenLoader message="Estamos dejando todo listo para ti!" />;
  }

  // Solo se renderiza Y ejecuta el componente correspondiente al rol del usuario
  switch (currentUserRole) {
    case RawRole.ADMIN_GLOBAL:
      return <AdminGlobalView />;

    case RawRole.ADMIN_GRUPO:
      return <AdminGrupoView />;

    case RawRole.ACUDIENTE:
      return <AcudienteView />;

    default:
      // Dashboard genérico para otros roles
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Bienvenido al sistema de gestión de scouts
              </p>
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground">
              Dashboard en construcción para el rol: {currentUserRole}
            </p>
          </div>
        </div>
      );
  }
}

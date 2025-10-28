import { useRoleContext } from "@/hooks/useRoleContext";
import { RawRole } from "@/roles/roles";
import AdminGlobalView from "./components/AdminGlobalView";
import AdminGrupoView from "./components/AdminGrupoView";
import AcudienteView from "./components/AcudienteView";
import ScoutView from "./components/ScoutView";
import ComiteAdminView from "./components/ComiteAdminView";
import ScouterView from "./components/ScouterView";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import TesoreroView from "./components/TesoreroView";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Dashboard() {
  const { currentUserRole, status } = useRoleContext();


  if (status === "loading" || status === "idle") {
    return <FullScreenLoader message="Estamos dejando todo listo para ti!" />;
  }

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        console.log("Access Token:", accessToken);
      } catch (error) {
        console.error("Error al obtener el token:", error);
      }
    };

    obtenerToken();
  }, [getAccessTokenSilently]);

  // Solo se renderiza Y ejecuta el componente correspondiente al rol del usuario
  switch (currentUserRole) {
    case RawRole.ADMIN_GLOBAL:
      return <AdminGlobalView />;

    case RawRole.ADMIN_GRUPO:
      return <AdminGrupoView />;

    case RawRole.ACUDIENTE:
      return <AcudienteView />;

    case RawRole.SCOUT:
      return <ScoutView />;

    case RawRole.COMITE_ADMIN:
      return <ComiteAdminView />;

    case RawRole.SCOUTER:
      return <ScouterView />;

    case RawRole.TESORERO:
      return <TesoreroView />;

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

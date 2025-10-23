import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { fetchMembersWithBranchAction } from "@/store/members/membersActions";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector((state) => state.members);

  useEffect(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

  // Información del usuario autenticado
  const { user } = useAuth0();
  const currentUserEmail = user?.email;
  const scoutInfo = members.find((m) => m.email === currentUserEmail);
  console.log("scoutInfo:", scoutInfo);

  // Simulación de progreso
  const progreso = { progreso: 75 };

  if (loading) {
    return <p className="text-center text-lg">Cargando información...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Error al cargar datos: {error}</p>
    );
  }

  if (!scoutInfo) {
    return (
      <p className="text-center text-gray-600">
        No se encontró información del scout.
      </p>
    );
  }

  if (!scoutInfo) {
    return (
      <p className="text-center text-gray-600">
        No se encontró información del scout.
      </p>
    );
  }

  // Render principal del dashboard
  return (
    <div className="mx-4 space-y-8">
      {/* Encabezado */}
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Hola, {scoutInfo.firstName}!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Aquí puedes ver tu información y progreso
        </p>
      </header>

      {/* Tarjeta de Información Personal */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Tu Información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-lg space-y-2">
            <li>
              <strong>Grupo:</strong>{" "}
              {scoutInfo.subgroup?.groupId || "Sin grupo"}
            </li>
            <li>
              <strong>Rama:</strong>{" "}
              {scoutInfo.subgroup?.name || "Sin rama"}
            </li>
            <li>
              <strong>Subrama:</strong>{" "}
              {scoutInfo.subgroup?.section?.name || "Sin subrama"}
            </li>
            <li>
              <strong>Rol:</strong>{" "}
              {scoutInfo.role
                ? scoutInfo.role.charAt(0).toUpperCase() +
                  scoutInfo.role.slice(1).toLowerCase()
                : "Sin rol"}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tarjeta de Progreso */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Tu Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-3">
            <div
              className="bg-green-500 h-6 rounded-full transition-all duration-500"
              style={{ width: `${progreso.progreso}%` }}
            ></div>
          </div>
          <p className="text-lg text-center">
            Has completado el <strong>{progreso.progreso}%</strong> de tus
            actividades.
          </p>
        </CardContent>
      </Card>

      {/* Tarjeta de Retos */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Próximos Retos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-lg">
            <li>Construir una tienda de campaña</li>
            <li>Aprender a hacer nudos básicos</li>
            <li>Explorar el bosque cercano</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

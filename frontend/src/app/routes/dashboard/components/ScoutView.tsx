import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAuth0 } from "@auth0/auth0-react";

import { fetchMembersWithBranchAction } from "@/store/members/membersActions";

const Dashboard = () => {
  const dispatch = useAppDispatch();

  // Obtenemos el estado global de miembros desde Redux
  const { members, loading, error } = useAppSelector((state) => state.members);

  useEffect(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

  // Información del usuario autenticado (Auth0)
  const { user } = useAuth0();
  const currentUserEmail = user?.email;
  const scoutInfo = members.find((m) => m.email === currentUserEmail);
  console.log("📦 scoutInfo:", scoutInfo);

  // Simulación de progreso
  const progreso = {
    progreso: 75, 
  };

  if (loading) {
    return <p className="text-center text-lg">Cargando información...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error al cargar datos: {error}
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
    <div className="mx-4">
      {/* Encabezado */}
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Hola, {scoutInfo.firstName}!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Aquí puedes ver tu información y progreso
        </p>
      </header>

      {/* Información personal */}
      <section className="my-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-3xl font-bold text-primary mb-4">Tu Información</h3>
        <ul className="text-lg space-y-2">
        <li>
          <strong>Grupo:</strong> {scoutInfo.subgroup?.groupId || "Sin grupo"} 
        </li>
        <li>
          <strong>Rama:</strong> {scoutInfo.subgroup?.name || "Sin rama"}
        </li>
        <li>
          <strong>Subrama:</strong> {scoutInfo.subgroup?.section?.name || "Sin subrama"}
        </li>
        <li>
            <strong>Rol:</strong>{" "}
            {scoutInfo.role
              ? scoutInfo.role.charAt(0).toUpperCase() +
                scoutInfo.role.slice(1).toLowerCase()
              : "Sin rol"}
          </li>
      </ul>
      </section>

      {/* Barra de progreso */}
      <section className="my-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-3xl font-bold text-primary mb-4">Tu Progreso</h3>

        {/* Barra visual */}
        <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-green-500 h-6 rounded-full transition-all duration-500"
            style={{ width: `${progreso.progreso}%` }}
          ></div>
        </div>

        <p className="text-lg mt-2 text-center">
          Has completado el{" "}
          <strong>{progreso.progreso}%</strong> de tus actividades.
        </p>
      </section>


      {/* Actividades recientes y retos */}
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-bold text-primary mb-2">
              Próximos Retos
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Construir una tienda de campaña</li>
              <li>Aprender a hacer nudos básicos</li>
              <li>Explorar el bosque cercano</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;




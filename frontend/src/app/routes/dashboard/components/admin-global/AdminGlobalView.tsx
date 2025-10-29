import { useAuth0 } from "@auth0/auth0-react";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import HeaderCard from "./HeaderCard";
//import GroupsDistribution from "./GroupsDistribution";
import { useGroupsStats } from "@/hooks/useGroupsStats";

const loading = false;

const AdminGlobalView = () => {
  const { user } = useAuth0();
  const { groups } = useGroupsStats();

  console.log("Groups in AdminGlobalView:", groups);

  if (loading) {
    return <FullScreenLoader message="Cargando..." />;
  }

  return (
    <div className="mx-4">
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Bienvenido, {user?.nickname}!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Gestiona los grupos de la plataforma desde aquí
        </p>
      </header>
      <section className="my-2 flex gap-6">
        <HeaderCard />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"></div>
      </section>
    </div>
  );
};

export default AdminGlobalView;

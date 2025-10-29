import { useAuth0 } from "@auth0/auth0-react";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import HeaderCard from "./HeaderCard";
//import GroupsDistribution from "./GroupsDistribution";
import { useGroupsStats } from "@/hooks/useGroupsStats";
import GroupsDistribution from "./GroupsDistribution";

const loading = false;

const AdminGlobalView = () => {
  const { user } = useAuth0();
  const {
    groups,
    memberCounts,
    totalMembersCount,
    activeGroupsCount,
    inactiveGroupsCount,
  } = useGroupsStats();

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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="my-8">
        <HeaderCard
          total_members_count={totalMembersCount}
          active_groups_count={activeGroupsCount}
          inactive_groups_count={inactiveGroupsCount}
        />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 gap-6">
          <GroupsDistribution memberCounts={memberCounts} />
        </div>
      </section>
      </section>
    </div>
  );
};

export default AdminGlobalView;

import { useAuth0 } from "@auth0/auth0-react";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import HeaderCard from "./HeaderCard";
//import GroupsDistribution from "./GroupsDistribution";
import { useGroupsStats } from "@/hooks/useGroupsStats";
import GroupsDistribution from "./GroupsDistribution";

const AdminGlobalView = () => {
  const { user } = useAuth0();
  const {
    groups,
    memberCounts,
    totalMembersCount,
    activeGroupsCount,
    inactiveGroupsCount,
    loading,
  } = useGroupsStats();

  console.log("Groups in AdminGlobalView:", groups);

  if (loading) {
    return <FullScreenLoader message="Cargando..." />;
  }

  return (
    <div className="mx-2 sm:mx-4">
      <header className="flex flex-col items-center mb-4 justify-center px-2">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-center">
          ¡Bienvenido, {user?.nickname}!
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text my-3 text-center">
          Gestiona los grupos de la plataforma desde aquí
        </p>
      </header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:grid-flow-row lg:auto-rows-max">
        <div className="my-4 sm:my-8">
          <HeaderCard
            total_members_count={totalMembersCount}
            active_groups_count={activeGroupsCount}
            inactive_groups_count={inactiveGroupsCount}
          />
        </div>
        <div className="my-4 sm:my-8 flex max-h-[350px]">
          <GroupsDistribution memberCounts={memberCounts} />
        </div>
      </section>
    </div>
  );
};

export default AdminGlobalView;

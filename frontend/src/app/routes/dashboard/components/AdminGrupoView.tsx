/*import { useEffect, useMemo } from "react";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";*/
import { useAuth0 } from "@auth0/auth0-react";
import { useMembersManagement } from "@/hooks/useMembersManagement";
import HomeCard from "./HomeCard";
import GenderChart from "./GenderChart";
import BranchDistribution from "./BranchDistribution";
import GeneralStats from "./GeneralStats";

const AdminGrupoView = () => {
  useMembersManagement();
  const { user } = useAuth0();
  const { branchMemberCount, branchMembers, members, scoutMembers, nuevosEsteMes } =
    useMembersManagement();
  console.log("Branch member count:", branchMemberCount);

  let scoutsActivos = 0;
  scoutMembers.map((member) => {
    if (member.isActive) {
      scoutsActivos += 1;
    }
  });

  const stats = {
    totalScouts: scoutMembers.length || 0,
    scoutsActivos: scoutsActivos,
    totalRamas: branchMembers.length || 0,
    nuevosEsteMes: nuevosEsteMes,
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Bienvenido, {user?.nickname}!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Gestiona tu grupo scout desde aquí
        </p>
      </header>
      <section className="my-2 flex gap-6">
        <HomeCard stats={stats} />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <GenderChart members={scoutMembers || []} />
          <BranchDistribution branchMembers={Object.entries(branchMemberCount || {})} />
          <GeneralStats members={members || []} />
        </div>
      </section>
    </div>
  );
};

export default AdminGrupoView;
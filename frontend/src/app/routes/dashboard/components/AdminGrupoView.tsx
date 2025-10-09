import { useEffect, useMemo } from "react";
import HomeCard from "./HomeCard";
import BranchDistribution from "./BranchDistribution";
import GeneralStats from "./GeneralStats";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { fetchMembersAction } from "@/store/members/membersActions";

const AdminGrupoView = () => {
  const dispatch = useAppDispatch();
  const { members, loading } = useMember();

  // Cargar miembros al montar el componente
  useEffect(() => {
    dispatch(fetchMembersAction());
  }, [dispatch]);

  // Calcular métricas derivadas de los datos de miembros
  const stats = useMemo(() => {
    if (!members || members.length === 0) {
      return {
        totalScouts: 0,
        scoutsActivos: 0,
        totalRamas: 0,
        nuevosEsteMes: 0,
      };
    }

    // Total de scouts (excluyendo admins)
    const totalScouts = members.filter(
      (m) => m.role === "scout" && m.status === "active"
    ).length;

    // Scouts activos
    const scoutsActivos = members.filter(
      (m) => m.isActive && m.status === "active"
    ).length;

    // Total de ramas únicas
    const ramasSet = new Set<string>();
    members.forEach((m) => {
      if (m.branch && m.branch.length > 0) {
        m.branch.forEach((rama) => {
          if (rama.nombre) ramasSet.add(rama.nombre);
        });
      }
    });
    const totalRamas = ramasSet.size;

    // Nuevos scouts este mes
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const nuevosEsteMes = members.filter((m) => {
      if (!m.created_at) return false;
      const fecha = new Date(m.created_at);
      return fecha >= inicioMes;
    }).length;

    return {
      totalScouts,
      scoutsActivos,
      totalRamas,
      nuevosEsteMes,
    };
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="mx-4">
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Bienvenido, Jefe de grupo!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Gestiona tu grupo scout desde aquí
        </p>
      </header>
      <section className="my-2 flex gap-6">
        <HomeCard stats={stats} />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BranchDistribution members={members || []} />
          <GeneralStats members={members || []} />
        </div>
      </section>
    </div>
  );
}

export default AdminGrupoView;
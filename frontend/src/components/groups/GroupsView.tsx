import { useEffect, useMemo } from "react";
import { ScoutGroupCard } from "./ScoutGroupCard";
import { useGroup } from "@/hooks/useGroup";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGroupsAction } from "@/store/groups/groupsActions";
import { filterActiveGroups } from "@/utils/groupStatus";

export function GroupsView() {
  const dispatch = useAppDispatch();
  const { groups, loading, error } = useGroup();

  useEffect(() => {
    // Solo hacer fetch si no hay grupos cargados
    if (!groups || groups.length === 0) {
      dispatch(fetchGroupsAction());
    }
  }, [dispatch, groups]);

  // Memoizar grupos activos usando la utilidad
  const activeGroups = useMemo(() => {
    if (!groups) return [];
    return filterActiveGroups(groups);
  }, [groups]);

  return (
    <section id="nuestros-grupos" className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Nuestros Grupos Scout
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Conoce los grupos scouts que forman parte de nuestra organización. Cada uno es un espacio único para crecer
          y vivir la experiencia scout.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && (
          <div className="col-span-full text-center py-8">
            <div className="text-lg">Cargando grupos...</div>
          </div>
        )}
        
        {error && (
          <div className="col-span-full text-center py-8">
            <div className="text-red-600">Error cargando grupos: {error}</div>
          </div>
        )}
        
        {!loading && !error && activeGroups.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">No hay grupos disponibles.</div>
          </div>
        )}
        
        {!loading && !error && activeGroups.map((group) => (
          <ScoutGroupCard 
            key={`${group.groupId}-${group.slug}`} 
            group={group} 
          />
        ))}
      </div>
    </section>
  );
}
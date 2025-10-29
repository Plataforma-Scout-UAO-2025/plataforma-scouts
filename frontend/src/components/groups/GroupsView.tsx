import { useEffect, useState } from "react";
import { ScoutGroupCard } from "./ScoutGroupCard";
import { getGroups } from "@/api/groupsApi";
import type { GroupResponseDTO } from "@/types/group.type";

export function GroupsView() {
  const [groups, setGroups] = useState<GroupResponseDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGroups();
        if (mounted) setGroups(data);
      } catch (err: any) {
        console.error("Failed to load groups", err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
        
        {!loading && !error && groups && groups.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">No hay grupos disponibles.</div>
          </div>
        )}
        
        {!loading && !error && groups && groups.map((group) => (
          <ScoutGroupCard key={group.groupId || group.slug} group={group} />
        ))}
      </div>
    </section>
  );
}
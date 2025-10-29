import { useEffect, useState } from "react";
import { ScoutGroupCard } from "./ScoutGroupCard";
import { getTenants } from "@/api/tenantsApi";
import type { Tenant } from "@/api/tenantsApi";

export function TenantsView() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTenants();
        if (mounted) setTenants(data);
      } catch (err: any) {
        console.error("Failed to load tenants", err);
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
        
        {!loading && !error && tenants && tenants.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">No hay grupos disponibles.</div>
          </div>
        )}
        
        {!loading && !error && tenants && tenants.map((tenant) => (
          <ScoutGroupCard key={tenant.tenant_id || tenant.id || tenant.slug} tenant={tenant} />
        ))}
      </div>
    </section>
  );
}
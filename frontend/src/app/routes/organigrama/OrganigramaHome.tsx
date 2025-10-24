import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useTenantParams } from "./organigramaRamas_Subramas/hooks/useTenantParams";
import { fetchGroupAction } from "@/store/organigrama/organigramaActions";
import type { RootState, AppDispatch } from "@/store/store";

export default function OrganigramaHome() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { tenantId, groupSlug, isFetching: tenantLoading } = useTenantParams();
  const { group, loading } = useSelector(
    (state: RootState) => state.organigrama
  );

  // Fetch group information when tenant params are available
  useEffect(() => {
    if (tenantId && groupSlug && !group) {
      dispatch(fetchGroupAction({ tenantId, groupSlug }));
    }
  }, [dispatch, tenantId, groupSlug, group]);

  const cards = [
    {
      title: "Gestión del Organigrama",
      subtitle: "Vista principal con ramas y subramas",
      path: "/app/organigrama/ramas-y-subramas",
    },
    {
      title: "Niveles Organizativos",
      subtitle: "Control Administrativo y Técnico",
      path: "/app/organigrama/niveles-organizativos",
    },
    {
      title: "Resumen Completo",
      subtitle: "Jerarquía visual completa",
      path: "/app/organigrama/resumen",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-8 py-10">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-primary">
          {loading || tenantLoading ? (
            <span className="animate-pulse">Cargando...</span>
          ) : (
            group?.name || "Grupo Scout"
          )}
        </h1>
        <p className="text-accent-foreground text-lg">
          Sistema de Gestión del Organigrama
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
        {cards.map((card) => (
          <Card
            key={card.title}
            role="button"
            tabIndex={0}
            onClick={() => navigate(card.path)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(card.path);
              }
            }}
            className="
              cursor-pointer w-full max-w-sm
              border border-border bg-card
              p-6 rounded-xl shadow-sm
              transition-all
              hover:shadow-md hover:bg-accent hover:border-primary
              focus:outline-none focus:ring-2 focus:ring-primary/40
            "
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg font-semibold text-primary mb-1">
                  {card.title}
                </h2>
                <p className="text-accent-foreground text-sm">
                  {card.subtitle}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <span className="text-secondary font-semibold text-xl leading-none">
                  ›
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

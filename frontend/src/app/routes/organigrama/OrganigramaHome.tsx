import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function OrganigramaHome() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Gestión del Organigrama",
      subtitle: "Vista principal con ramas y subramas",
      path: "/app/organigrama/ramas-y-subramas", // ✅ corregido
    },
    {
      title: "Niveles Organizativos",
      subtitle: "Control Administrativo y Técnico",
      path: "/app/organigrama/niveles-organizativos", // ✅ corregido
    },
    {
      title: "Resumen Completo",
      subtitle: "Jerarquía visual completa",
      path: "/app/organigrama/resumen", // ✅ corregido
    },
  ];

  return (
    <div className="p-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-emerald-900">
          Grupo Scout Centinelas 113
        </h1>
        <p className="text-gray-700 text-lg">
          Sistema de Gestión del Organigrama
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
        {cards.map((card) => (
          <Card
            key={card.title}
            onClick={() => navigate(card.path)}
            className="cursor-pointer p-6 w-full max-w-sm border-2 border-transparent hover:border-emerald-600 hover:shadow-md transition-all"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900 mb-1">
                  {card.title}
                </h2>
                <p className="text-gray-600 text-sm">{card.subtitle}</p>
              </div>
              <div className="flex justify-end mt-4">
                <span className="text-emerald-700 font-semibold">›</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

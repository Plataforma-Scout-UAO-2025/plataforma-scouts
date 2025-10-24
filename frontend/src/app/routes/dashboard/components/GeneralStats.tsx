import type { Member } from "@/types/member.type";
import { User2 } from "lucide-react";

interface GeneralStatsProps {
  members: Member[];
}

const GeneralStats = ({ members }: GeneralStatsProps) => {
  const isScout = (role: string | undefined) => role?.toUpperCase() === "SCOUT";

  // Calcular edad promedio
  const conEdad = members.filter((m) => m.age && isScout(m.role));
  const edadPromedio = conEdad.length > 0
    ? Math.round(conEdad.reduce((acc, m) => acc + (m.age || 0), 0) / conEdad.length)
    : 0;

  const estadisticas = [
    {
      icon: User2,
      titulo: "Edad Promedio",
      valor: edadPromedio > 0 ? `${edadPromedio} años` : "N/A",
      detalle: conEdad.length > 0 ? `${conEdad.length} scouts con edad registrada` : "Sin datos",
      color: "text-blue-600",
    }
  ];

  return (
    <div className="border rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <p className="text-xl font-bold text-text">Estadísticas Generales</p>
        <p className="text-accent-foreground text-sm">
          Métricas importantes del grupo
        </p>
      </div>
      
      <div className="space-y-4">
        {estadisticas.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/60 transition-colors"
          >
            <div className={`p-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-accent-foreground">{stat.titulo}</p>
              <p className="text-lg font-bold text-text">{stat.valor}</p>
              <p className="text-xs text-accent-foreground">{stat.detalle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneralStats;

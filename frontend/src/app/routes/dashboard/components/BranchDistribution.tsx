import type { Member } from "@/types/member.type";
import { Users } from "lucide-react";

interface BranchDistributionProps {
  members: Member[];
}

const BranchDistribution = ({ members }: BranchDistributionProps) => {

  console.log(members);
  const isScout = (role: string | undefined) => role?.toUpperCase() === "SCOUT";
  const scoutsPorRama: Record<string, number> = {};

  members.filter(m => isScout(m.role)).forEach((m) => {
    if (m.branch && m.branch.length > 0) {
      m.branch.forEach((rama) => {
        const nombre = rama.name || "Sin rama";
        scoutsPorRama[nombre] = (scoutsPorRama[nombre] || 0) + 1;
      });
    } else {
      scoutsPorRama["Sin rama"] = (scoutsPorRama["Sin rama"] || 0) + 1;
    }
  });

  // Ordenar por cantidad descendente
  const ramasOrdenadas = Object.entries(scoutsPorRama)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Mostrar máximo 6 ramas

  // Calcular porcentajes
  const total = members.length || 1;

  return (
    <div className="border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-primary w-6 h-6" />
        <div>
          <p className="text-xl font-bold text-text">Distribución por Rama</p>
          <p className="text-accent-foreground text-sm">
            Scouts en cada rama del grupo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ramasOrdenadas.length === 0 ? (
          <p className="text-accent-foreground text-center py-4">
            No hay datos de ramas disponibles
          </p>
        ) : (
          ramasOrdenadas.map(([rama, cantidad]) => {
            const porcentaje = Math.round((cantidad / total) * 100);

            return (
              <div key={rama} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">{rama}</span>
                  <span className="text-primary font-bold">
                    {cantidad} scout{cantidad !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <p className="text-accent-foreground text-sm text-right">
                  {porcentaje}% del total
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BranchDistribution;

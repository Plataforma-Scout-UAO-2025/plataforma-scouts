import type { Member } from "@/types/member.type";
import { Users } from "lucide-react";

interface BranchDistributionProps {
  members: Member[];
}

const BranchDistribution = ({ members }: BranchDistributionProps) => {

  // Contar scouts por rama
  const countBySection: Record<string, number> = {};

  members.forEach((member: Member) => {
    const rec = member as unknown as Record<string, unknown>;

    const branches = rec["branch"] as unknown;
    if (Array.isArray(branches) && branches.length > 0) {
      branches.forEach((b) => {
        const br = b as Record<string, unknown> | string | undefined;
        const name = (
          typeof br === "string"
            ? br
            : (br && (br["name"] ?? br["nombre"])) ?? "Sin rama"
        ) as string;
        countBySection[name] = (countBySection[name] || 0) + 1;
      });
      return;
    }

    const subgroup = rec["subgroup"] as Record<string, unknown> | undefined;
    if (subgroup) {
      const section = subgroup["section"] as
        | Record<string, unknown>
        | undefined;
      const sectionName = (section &&
        (section["name"] ?? section["nombre"])) as string | undefined;
      if (sectionName) {
        countBySection[sectionName] = (countBySection[sectionName] || 0) + 1;
        return;
      }
      const subgroupName = (subgroup["name"] ?? subgroup["nombre"]) as
        | string
        | undefined;
      if (subgroupName) {
        countBySection[subgroupName] = (countBySection[subgroupName] || 0) + 1;
        return;
      }
    }

    const sectionNameDirect = (rec["section_name"] ?? rec["sectionName"]) as
      | string
      | undefined;
    if (sectionNameDirect) {
      countBySection[sectionNameDirect] =
        (countBySection[sectionNameDirect] || 0) + 1;
      return;
    }
  });
  // Ordenar por cantidad descendente
  const ramasOrdenadas = Object.entries(countBySection)
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

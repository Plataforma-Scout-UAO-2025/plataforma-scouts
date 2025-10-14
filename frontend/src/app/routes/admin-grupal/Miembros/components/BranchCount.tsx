import type { Member } from "@/types/member.type";
import { useMemo } from "react";

interface BranchCountProps {
  filteredMembers: Member[];
  totalMembers: number;
}

const BranchCount = ({ filteredMembers, totalMembers }: BranchCountProps) => {
  const branchCounts = useMemo(() => {
    const total = totalMembers;

    // Contar miembros por rama/sección
    const countBySection: Record<string, number> = {};

    filteredMembers.forEach((member: Member) => {
      if (member.section_name) {
        countBySection[member.section_name] =
          (countBySection[member.section_name] || 0) + 1;
      }
    });

    // Construir array de contadores: primero el total, luego cada rama ordenada por cantidad
    const counts = [{ label: "Total Miembros", count: total, isTotal: true }];

    // Agregar cada rama ordenada de mayor a menor cantidad de miembros
    Object.entries(countBySection)
      .sort(([, a], [, b]) => b - a)
      .forEach(([sectionName, count]) => {
        counts.push({ label: sectionName, count, isTotal: false });
      });

    return counts;
  }, [filteredMembers, totalMembers]);

  return (
    <>
      {branchCounts.length > 0 ? (
        branchCounts.map((item, index) => (
          <div
            key={index}
            className={`border rounded-xl shadow-sm p-3 flex items-center gap-3 w-1/5`}
          >
            <div className="p-3 w-full">
              <p
                className={`text-sm md:text-lg mb-2 font-bold ${
                  item.isTotal ? "text-primary" : "text-primary"
                }`}
              >
                {item.count}
              </p>
              <p className="text-sm md:text-base text-text font-semibold">
                {item.label}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="border rounded-xl shadow-sm p-3 flex items-center gap-3 w-1/5">
          <div className="p-3">
            <p className="text-sm md:text-lg text-primary mb-2 font-bold">0</p>
            <p className="text-sm md:text-lg text-text font-bold">
              Total Miembros
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BranchCount;

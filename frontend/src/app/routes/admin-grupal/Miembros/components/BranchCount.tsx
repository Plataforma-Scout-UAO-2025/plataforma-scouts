import type { Member } from "@/types/member.type";
import { useMemo } from "react";

interface BranchCountProps {
  filteredMembers: Member[];
  totalMembers: number;
}

const BranchCount = ({ filteredMembers, totalMembers }: BranchCountProps) => {
  console.log("Rendering BranchCount with members:", filteredMembers);
  const branchCounts = useMemo(() => {
    const total = totalMembers;
    const countBySection: Record<string, number> = {};

    filteredMembers.forEach((member: Member) => {
      const rec = member as unknown as Record<string, unknown>;

      const branches = rec["branch"] as unknown;
      if (Array.isArray(branches) && branches.length > 0) {
        branches.forEach((b) => {
          const br = b as Record<string, unknown> | string | undefined;
          const name = (typeof br === "string"
            ? br
            : (br && (br["name"] ?? br["nombre"])) ?? "Sin rama") as string;
          countBySection[name] = (countBySection[name] || 0) + 1;
        });
        return;
      }

      const subgroup = rec["subgroup"] as Record<string, unknown> | undefined;
      if (subgroup) {
        const section = subgroup["section"] as Record<string, unknown> | undefined;
        const sectionName = (section && (section["name"] ?? section["nombre"])) as string | undefined;
        if (sectionName) {
          countBySection[sectionName] = (countBySection[sectionName] || 0) + 1;
          return;
        }
        const subgroupName = (subgroup["name"] ?? subgroup["nombre"]) as string | undefined;
        if (subgroupName) {
          countBySection[subgroupName] = (countBySection[subgroupName] || 0) + 1;
          return;
        }
      }

      const sectionNameDirect = (rec["section_name"] ?? rec["sectionName"]) as string | undefined;
      if (sectionNameDirect) {
        countBySection[sectionNameDirect] = (countBySection[sectionNameDirect] || 0) + 1;
        return;
      }
    });

    const counts = [{ label: "Total Miembros", count: total, isTotal: true }];

    // Agregar cada rama ordenada de mayor a menor cantidad de miembros
    Object.entries(countBySection)
      .sort(([, a], [, b]) => b - a)
      .forEach(([sectionName, count]) => {
        counts.push({ label: sectionName, count, isTotal: false });
      });

    return counts;
  }, [totalMembers]);

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

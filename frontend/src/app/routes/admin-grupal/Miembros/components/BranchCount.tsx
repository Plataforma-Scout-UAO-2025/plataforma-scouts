import { useMemo } from "react";

interface BranchCountProps {
  branchMemberCount: Record<string, number>;
  totalMembers: number;
}

const BranchCount = ({ branchMemberCount, totalMembers }: BranchCountProps) => {
  const branchCounts = useMemo(() => {
    const counts = [
      { label: "Total Miembros", count: totalMembers, isTotal: true },
    ];

    Object.entries(branchMemberCount).forEach(([sectionName, count]) => {
      counts.push({ label: sectionName, count, isTotal: false });
    });

    return counts;
  }, [branchMemberCount, totalMembers]);

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

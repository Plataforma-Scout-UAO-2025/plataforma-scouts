import type { GroupMembersDTO } from "@/types/group.type";

interface GroupsDistributionProps {
  memberCounts: GroupMembersDTO[];
}

const GroupsDistribution = ({ memberCounts }: GroupsDistributionProps) => {
 
  return (
    <div className="border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col w-full">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div>
          <p className="text-lg sm:text-xl font-bold text-text">
            Distribución por Grupo
          </p>
          <p className="text-accent-foreground text-xs sm:text-sm">
            Miembros en cada grupo
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2 max-h-[calc(100vh-400px)] lg:max-h-[350px]">
        {memberCounts.length === 0 ? (
          <p className="text-accent-foreground text-center py-4 text-sm">
            No hay datos de grupos disponibles
          </p>
        ) : (
          memberCounts.map((memberCount) => {
            const totalMembers = memberCounts.reduce(
              (total, group) => total + group.member_count,
              0
            );
            const porcentaje = Math.round(
              (memberCount.member_count / totalMembers) * 100
            );

            return (
              <div key={memberCount.group_name} className="space-y-2">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="text-text font-medium text-sm sm:text-base break-words max-w-[60%]">
                    {memberCount.group_name}
                  </span>
                  <span className="text-primary font-bold text-sm sm:text-base whitespace-nowrap">
                    {memberCount.member_count} Miembro
                    {memberCount.member_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  {memberCount.status === "ACTIVE" ? (
                    <span className="inline-block px-2 py-1 rounded-lg border border-green-300 bg-green-100 text-green-800 font-semibold text-xs sm:text-sm">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold text-xs sm:text-sm">
                      Inactivo
                    </span>
                  )}
                  <p className="text-accent-foreground text-xs sm:text-sm">
                    {porcentaje}% del total
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GroupsDistribution;

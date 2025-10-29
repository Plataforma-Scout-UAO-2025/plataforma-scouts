import type { GroupMembersDTO } from "@/types/group.type";

interface GroupsDistributionProps {
  memberCounts: GroupMembersDTO[];
}

const GroupsDistribution = ({ memberCounts }: GroupsDistributionProps) => {
  return (
    <div className="border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <p className="text-xl font-bold text-text">Distribución por Grupo</p>
          <p className="text-accent-foreground text-sm">
            Miembros en cada grupo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {memberCounts.length === 0 ? (
          <p className="text-accent-foreground text-center py-4">
            No hay datos de grupos disponibles
          </p>
        ) : (
          memberCounts.map((memberCount) => {
            const totalMembers = memberCounts.reduce(
              (total, group) => total + group.member_count,
              0
            );
            const porcentaje = Math.round((memberCount.member_count / totalMembers) * 100);

            return (
              <div key={memberCount.group_name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">{memberCount.group_name}</span>
                  <span className="text-primary font-bold">
                    {memberCount.member_count} Miembro{memberCount.member_count !== 1 ? "s" : ""}
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

export default GroupsDistribution;

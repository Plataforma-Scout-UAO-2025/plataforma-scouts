
interface GroupsDistributionProps {
  groupMembers: [string, number][];
}

const GroupsDistribution = ({ groupMembers }: GroupsDistributionProps) => {
  const total = groupMembers.reduce((sum, [, count]) => sum + count, 0);
  return (
    <div className="border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <p className="text-xl font-bold text-text">Distribución por Rama</p>
          <p className="text-accent-foreground text-sm">
            Scouts en cada rama del grupo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {groupMembers.length === 0 ? (
          <p className="text-accent-foreground text-center py-4">
            No hay datos de ramas disponibles
          </p>
        ) : (
          groupMembers.map(([grupo, cantidad]) => {
            const porcentaje = Math.round((cantidad / total) * 100);

            return (
              <div key={grupo} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">{grupo}</span>
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

export default GroupsDistribution;

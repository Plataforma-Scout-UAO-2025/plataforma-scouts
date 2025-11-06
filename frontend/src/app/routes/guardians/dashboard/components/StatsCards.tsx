import { Users } from 'lucide-react';
import { useGuardianMemberId } from '@/app/routes/guardians/hooks/useGuardianMemberId';
import { useMembersInChargeOf } from '@/hooks/useMembersInChargeOf';

export default function StatsCards() {
  // Obtener miembros a cargo usando el hook
  const { memberId: guardianId } = useGuardianMemberId();
  const { members, loading } = useMembersInChargeOf(guardianId);

  const estadisticas = [
    {
      icon: Users,
      titulo: "Miembros a Cargo",
      valor: loading ? "..." : members.length.toString(),
      detalle: "Total de miembros",
      color: "text-blue-600",
    }
  ];

  return (
    <div className="mx-4">
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {estadisticas.map((stat, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-sm p-6"
            >
              <div className="mb-6">
                <p className="text-xl font-bold text-text">{stat.titulo}</p>
                <p className="text-accent-foreground text-sm">
                  {stat.detalle}
                </p>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg">
                <div className={`p-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-text">{stat.valor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
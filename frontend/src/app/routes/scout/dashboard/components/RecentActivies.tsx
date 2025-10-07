import { recentActivities } from "@/lib/mockObjects";

const RecentActivities = () => {
  return (
    <div className="border rounded-xl shadow-sm p-12">
      <p className="text-xl font-bold text-text mb-2">Actividad Reciente</p>
      <p className="text-accent-foreground mb-4">
        Últimas acciones en la plataforma
      </p>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 hover:bg-accent-foreground/10 rounded-lg"
          >
            <activity.icon className="text-primary w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-text font-medium">{activity.title}</p>
              <p className="text-accent-foreground text-sm">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;

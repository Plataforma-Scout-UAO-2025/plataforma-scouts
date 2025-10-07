import { pendingTasks } from "@/lib/mockObjects";

const PendingTasks = () => {
  return (
    <div className="border rounded-xl shadow-sm p-12">
      <p className="text-xl font-bold text-text mb-2">Tareas Pendientes</p>
      <div className="space-y-4">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 hover:bg-accent-foreground/10 rounded-lg"
          >
            <task.icon className="text-primary w-5 h-5 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-text font-medium">{task.title}</p>
              <p className="text-accent-foreground text-sm">
                {task.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTasks;

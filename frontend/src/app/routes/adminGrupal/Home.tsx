import {
  homeCards,
  recentActivities,
  pendingTasks,
} from "../../../lib/mockObjects";

const Home = () => {
  return (
    <div className="mx-4">
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Bienvenido, Jefe de grupo!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Gestiona tu grupo scout desde aquí
        </p>
      </header>
      <section className="my-2 flex gap-6">
        {homeCards.map((item) => (
          <div
            className={`bg-accent rounded-xl shadow-md p-3 flex items-center w-1/4`}
          >
            <div className="p-4 w-full">
              <div className="pb-4 flex justify-between">
                <p className="text-md md:text-xl text-text font-bold pr-12">
                  {item.label}
                </p>
                <item.icon className="text-primary flex-shrink-0 w-12 h-12" />
              </div>
              <p className="text-md md:text-xl text-primary mb-2">
                {item.value}
                {item.label2 && (
                  <p className="text-sm md:text-base text-accent-foreground font-normal">
                    {item.label2}
                  </p>
                )}
              </p>
            </div>
          </div>
        ))}
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-accent rounded-xl shadow-md p-12">
            <p className="text-xl font-bold text-text mb-2">
              Actividad Reciente
            </p>
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
                    <p className="text-accent-foreground text-sm">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent rounded-xl shadow-md p-12">
            <p className="text-xl font-bold text-text mb-2">
              Tareas Pendientes
            </p>
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
        </div>
      </section>
    </div>
  );
};

export default Home;

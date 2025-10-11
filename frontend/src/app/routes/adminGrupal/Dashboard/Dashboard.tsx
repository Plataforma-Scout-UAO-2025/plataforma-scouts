import HomeCard from "./components/HomeCard";
import RecentActivities from "./components/RecentActivies";
import PendingTasks from "./components/PendingTasks";

const Dashboard = () => {
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
        <HomeCard />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities />
          <PendingTasks />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

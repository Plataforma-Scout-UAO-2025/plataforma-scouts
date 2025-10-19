
import HomeCard from "./components/HomeCard";
import RecentActivities from "./components/RecentActivies";


const Dashboard = () => {
  // Información del scout (simulada)
  const scoutInfo = {
    nombre: "Juan Pérez",
    grupo: "Grupo 1",
    rama: "Lobatos",
    subrama: "Manada Amarilla",
    progreso: 75, 
  };

  return (
    <div className="mx-4">
      {/* Encabezado */}
      <header className="flex flex-col items-center mb-4 justify-center">
        <p className="text-5xl font-bold text-primary">
          ¡Hola, {scoutInfo.nombre}!
        </p>
        <p className="text-2xl font-bold text-text my-3">
          Aquí puedes ver tu información y progreso
        </p>
      </header>

      {/* Información del grupo */}
      <section className="my-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-3xl font-bold text-primary mb-4">
          Tu Información
        </h3>
        <ul className="text-lg">
          <li>
            <strong>Grupo:</strong> {scoutInfo.grupo}
          </li>
          <li>
            <strong>Rama:</strong> {scoutInfo.rama}
          </li>
          <li>
            <strong>Subrama:</strong> {scoutInfo.subrama}
          </li>
        </ul>
      </section>

      {/* Progreso */}
      <section className="my-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-3xl font-bold text-primary mb-4">Tu Progreso</h3>
        <div className="relative w-full bg-gray-200 rounded-full h-6">
          <div
            className="bg-green-500 h-6 rounded-full"
            style={{ width: `${scoutInfo.progreso}%` }}
          ></div>
        </div>
        <p className="text-lg mt-2">
          Has completado el{" "}
          <strong>{scoutInfo.progreso}%</strong> de tus actividades.
        </p>
      </section>

      <section className="my-2 flex gap-6">
        <HomeCard />
      </section>
      <section className="my-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities />
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-bold text-primary mb-2">
              Próximos Retos
            </h3>
            <ul className="list-disc pl-5">
              <li>Construir una tienda de campaña</li>
              <li>Aprender a hacer nudos básicos</li>
              <li>Explorar el bosque cercano</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
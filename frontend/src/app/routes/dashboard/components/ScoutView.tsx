import { useAuth0 } from "@auth0/auth0-react";

const ScoutView = () => {
  const { user } = useAuth0();
  // Información del scout
  const displayName = user?.nickname || "";

  const scoutInfo = {
    nombre: displayName,
    grupo: "Grupo 1",
    rama: "Lobatos",
    subrama: "Manada Amarilla",
    progreso: 75,
  };

  // Actividades recientes
  const actividades = [
    "Gran Rally de Aventureros 2025",
    "Desafío de Orientación Nocturna",
    "Carrera de Supervivencia en la Montaña",
  ];

  // Próximos retos
  const retos = [
    "Construir una tienda de campaña",
    "Aprender a hacer nudos básicos",
    "Explorar el bosque cercano",
  ];

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
        <h3 className="text-3xl font-bold text-primary mb-4">Tu Información</h3>
        <ul className="text-lg space-y-1">
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
            className="bg-primary h-6 rounded-full"
            style={{ width: `${scoutInfo.progreso}%` }}
          ></div>
        </div>
        <p className="text-lg mt-2">
          Has completado el <strong>{scoutInfo.progreso}%</strong> de tus
          actividades.
        </p>
      </section>

      {/* Actividades y Retos */}
      <section className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividades */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-bold text-primary mb-2">
            Actividades Recientes
          </h3>
          <ul className="list-disc pl-5 text-lg">
            {actividades.map((actividad, index) => (
              <li key={index}>{actividad}</li>
            ))}
          </ul>
        </div>

        {/* Próximos Retos */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-xl font-bold text-primary mb-2">Próximos Retos</h3>
          <ul className="list-disc pl-5 text-lg">
            {retos.map((reto, index) => (
              <li key={index}>{reto}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ScoutView;
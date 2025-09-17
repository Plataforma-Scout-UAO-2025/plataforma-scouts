import { useState } from "react";
import { Plus, Edit, Trash2, Award } from "lucide-react";

interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
}

const mockInsignias: Insignia[] = [
  { id: 1, nombre: "Nudo Scout", descripcion: "Dominio de nudos básicos", categoria: "Técnica" },
  { id: 2, nombre: "Primeros Auxilios", descripcion: "Conocimientos de seguridad y salud", categoria: "Salud" },
  { id: 3, nombre: "Orientación", descripcion: "Uso de brújula y mapa", categoria: "Exploración" },
];

const Badges = () => {
  const [insignias, setInsignias] = useState<Insignia[]>(mockInsignias);

  const handleAgregar = () => {
    alert("Agregar nueva insignia");
  };

  const handleEditar = (id: number) => {
    alert(`Editar insignia con id ${id}`);
  };

  const handleEliminar = (id: number) => {
    setInsignias(insignias.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Insignias</h1>
      <p className="text-gray-600 mb-6">Administra las insignias del grupo scout.</p>

      <button
        onClick={handleAgregar}
        className="mb-6 bg-green-800 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center gap-2"
      >
        <Plus size={18} /> Crear Nueva Insignia
      </button>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insignias.map((insignia) => (
          <div
            key={insignia.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-3">
              <Award className="text-green-700" />
              <h2 className="text-xl font-semibold">{insignia.nombre}</h2>
            </div>
            <p className="text-gray-600 mb-2">{insignia.descripcion}</p>
            <span className="text-sm text-green-700 font-medium mb-4">
              Categoría: {insignia.categoria}
            </span>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleEditar(insignia.id)}
                className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
              >
                <Edit size={18} className="text-yellow-700" />
              </button>
              <button
                onClick={() => handleEliminar(insignia.id)}
                className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
              >
                <Trash2 size={18} className="text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;

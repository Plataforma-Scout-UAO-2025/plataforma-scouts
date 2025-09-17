import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function DetalleRamaClan() {
    const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/app/organigrama")}>Anterior</Button>

      <h1 className="text-2xl font-bold">Detalles de Clan - 2023</h1>

      {/* Información principal */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Información Principal</h2>
          <Button size="sm">Añadir Foto</Button>
        </div>
        <img
          src="https://picsum.photos/800/200?random=25"
          alt="foto clan"
          className="rounded-md w-full h-48 object-cover"
        />
        <p className="text-sm text-muted-foreground">
          Clan: aquí va la descripción general de la rama Clan, sus actividades y notas de referencia.
        </p>
      </div>

      {/* Integrantes */}
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">Integrantes en 2023</h2>
        <div className="flex flex-wrap gap-2">
          {["Mariana López", "David Sánchez", "Laura Pérez"].map((n) => (
            <span key={n} className="border px-3 py-1 rounded-md">
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Galería */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Galería de fotos - 2023</h2>
          <Button size="sm">Añadir Fotos</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[26, 27, 28].map((id) => (
            <img
              key={id}
              src={`https://picsum.photos/400/300?random=${id}`}
              alt={`foto ${id}`}
              className="rounded-md w-full h-32 object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function DetalleRamaTropa() {
    const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      {/* Botón volver */}
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate("/app/organigrama")}>
        <ArrowLeft className="h-4 w-4" /> Anterior
      </Button>

      {/* Título */}
      <h1 className="text-2xl font-bold">Detalles de Tropa - 2023</h1>

      {/* Información principal */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold">Información Principal</h2>
          <Button size="sm" className="bg-green-900 text-white hover:bg-green-800 flex gap-2">
            <Upload className="h-4 w-4" /> Añadir Foto
          </Button>
        </CardHeader>
        <CardContent>
          {/* Imagen grande */}
          <div className="relative rounded overflow-hidden mb-4">
            <img
              src="https://picsum.photos/800/250"
              alt="Tropa"
              className="w-full object-cover rounded"
            />
          </div>

          {/* Texto + Subramas */}
          <div className="space-y-3">
            <p className="font-semibold">Tropa</p>
            <p className="text-muted-foreground text-sm">
              The king, seeing how much happier his subjects were, realized the error of his ways
              and repealed the joke tax.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Patrulla Leones</Button>
              <Button variant="outline" size="sm">Patrulla Halcones</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrantes */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Integrantes en 2023</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Roberto Restrepo", "Carlos Camargo", "Ana Asprilla", "Marta Mora"].map((integrante, idx) => (
              <Button key={idx} variant="outline" size="sm">
                {integrante}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galería */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold">Galería de fotos - 2023</h2>
          <Button size="sm" className="bg-green-900 text-white hover:bg-green-800 flex gap-2">
            <Upload className="h-4 w-4" /> Añadir Fotos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["https://picsum.photos/200/200?1", "https://picsum.photos/200/200?2", "https://picsum.photos/200/200?3"].map((foto, idx) => (
              <img
                key={idx}
                src={foto}
                alt={`Foto ${idx + 1}`}
                className="w-full h-40 object-cover rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

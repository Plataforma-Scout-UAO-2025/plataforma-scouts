import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function detalleSubramaPatrullaLeones() {
    const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      {/* Botón volver */}
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate("/app/organigrama")}>
        <ArrowLeft className="h-4 w-4" /> Anterior
      </Button>

      {/* Título */}
      <h1 className="text-2xl font-bold">Detalles Patrulla Leones - 2023</h1>

      {/* Información principal */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold">Información Principal</h2>
          <Button size="sm" className="bg-green-900 text-white hover:bg-green-800 flex gap-2">
            <Upload className="h-4 w-4" /> Añadir Foto
          </Button>
        </CardHeader>
        <CardContent>
          {/* Imagen principal */}
          <div className="relative rounded overflow-hidden mb-4">
            <img
              src="https://picsum.photos/800/250?random=10"
              alt="Patrulla Leones"
              className="w-full object-cover rounded"
            />
          </div>

          {/* Texto descriptivo */}
          <div className="space-y-3">
            <p className="font-semibold">Tropa</p>
            <p className="text-muted-foreground text-sm">
              The king, seeing how much happier his subjects were, realized the error of his ways
              and repealed the joke tax.
            </p>
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
            {["Roberto Restrepo", "Carlos Camargo", "Ana Asprilla"].map((integrante, idx) => (
              <Button key={idx} variant="outline" size="sm">
                {integrante}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galería de fotos */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold">Galería de fotos - 2023</h2>
          <Button size="sm" className="bg-green-900 text-white hover:bg-green-800 flex gap-2">
            <Upload className="h-4 w-4" /> Añadir Fotos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "https://picsum.photos/200/200?random=21",
              "https://picsum.photos/200/200?random=22",
              "https://picsum.photos/200/200?random=23",
            ].map((foto, idx) => (
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

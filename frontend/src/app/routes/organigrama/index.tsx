import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function OrganigramaPage() {
  const navigate = useNavigate()

  const ramas = [
    { nombre: "Manada", route: "/app/organigrama/detalle-ramaManada" },
    { nombre: "Tropa", route: "/app/organigrama/detalle-ramaTropa" },
    { nombre: "Clan", route: "/app/organigrama/detalle-ramaClan" },
  ]

  const subramas = [
    { nombre: "Patrulla de Leones", route: "/app/organigrama/detalle-subramaPatrullaLeones" },
    { nombre: "Patrulla de Halcones", route: "/app/organigrama/detalle-subramaPatrullaHalcones" },
  ]

  return (
    <div className="p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold mb-2">Gestión de Organigrama</h1>
      <p className="text-muted-foreground mb-6">
        Administra la estructura de ramas y subramas de tu grupo scout
      </p>

      {/* Selector de año */}
      <div className="mb-6 w-40">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Ramas */}
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <h2 className="font-semibold">Ramas</h2>
            <Button
              size="sm"
              className="h-9 w-full justify-center bg-[#1A4134] hover:bg-[#1A4134] text-white rounded-md flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1A4134] shadow-none">
                <Plus className="h-4 w-4 text-white" />
              </span>
              <span className="font-medium">Crear Nueva Rama</span>
            </Button>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {ramas.map(({ nombre, route }) => (
                <li
                  key={nombre}
                  className="flex justify-between items-center border rounded px-3 py-2"
                >
                  <span>{nombre}</span>
                  <div className="flex space-x-2">
                    <Button size="icon" onClick={() => navigate(route)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Columna Subramas */}
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <h2 className="font-semibold">Subramas: Tropa</h2>
            <Button
              size="sm"
              className="h-9 w-full justify-center bg-[#1A4134] hover:bg-[#1A4134] text-white rounded-md flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1A4134] shadow-none">
                <Plus className="h-4 w-4 text-white" />
              </span>
              <span className="font-medium">Crear Nueva Subrama</span>
            </Button>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {subramas.map(({ nombre, route }) => (
                <li
                  key={nombre}
                  className="flex justify-between items-center border rounded px-3 py-2"
                >
                  <span>{nombre}</span>
                  <div className="flex space-x-2">
                    <Button size="icon" onClick={() => navigate(route)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


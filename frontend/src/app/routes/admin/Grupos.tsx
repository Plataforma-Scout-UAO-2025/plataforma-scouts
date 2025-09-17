import { useState } from "react"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScoutGroup {
  id: string
  name: string
  number: string
  section: string
  status: "Activo" | "Inactivo"
  ageGroup: "Infantil" | "Jovenes" | "Adolescentes"
  leader: {
    name: string
    email: string
    phone: string
  }
  location: string
  stats: {
    scouts: number
    insignias: number
    activities: number
  }
  progress: number
  foundedYear: number
}

const mockGroups: ScoutGroup[] = [
  {
    id: "1",
    name: "Grupo chiminigagua 803",
    number: "803",
    section: "Lobatos",
    status: "Activo",
    ageGroup: "Infantil",
    leader: {
      name: "María González",
      email: "maria@aventureros.scout",
      phone: "+34 600 123 456",
    },
    location: "Jamundí",
    stats: {
      scouts: 20,
      insignias: 20,
      activities: 6,
    },
    progress: 85,
    foundedYear: 2010,
  },
  {
    id: "2",
    name: "Grupo chiminigagua 803",
    number: "803",
    section: "Cachorros",
    status: "Activo",
    ageGroup: "Infantil",
    leader: {
      name: "Carlos Ruiz",
      email: "carlos@exploradores.scout",
      phone: "+34 600 234 567",
    },
    location: "Cali",
    stats: {
      scouts: 20,
      insignias: 20,
      activities: 6,
    },
    progress: 95,
    foundedYear: 2010,
  },
  {
    id: "3",
    name: "Grupo centinelas 113",
    number: "113",
    section: "Webelos",
    status: "Activo",
    ageGroup: "Adolescentes",
    leader: {
      name: "Ana López",
      email: "ana@rangers.scout",
      phone: "+34 600 345 678",
    },
    location: "Dagua",
    stats: {
      scouts: 20,
      insignias: 20,
      activities: 6,
    },
    progress: 78,
    foundedYear: 2010,
  },
  {
    id: "4",
    name: "Grupo centinelas 113",
    number: "113",
    section: "Scout",
    status: "Activo",
    ageGroup: "Jovenes",
    leader: {
      name: "Pedro Martín",
      email: "pedro@valle.scout",
      phone: "+34 600 456 789",
    },
    location: "Popayán",
    stats: {
      scouts: 20,
      insignias: 20,
      activities: 6,
    },
    progress: 65,
    foundedYear: 2010,
  },
]

export function Grupos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ageGroupFilter, setAgeGroupFilter] = useState("all")

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || group.status === statusFilter
    const matchesAgeGroup = ageGroupFilter === "all" || group.ageGroup === ageGroupFilter

    return matchesSearch && matchesStatus && matchesAgeGroup
  })

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Grupos</h1>
          <p className="text-lg text-gray-600">Vista general del estado de todos los grupos scout</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por grupos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas las ramas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ramas</SelectItem>
              <SelectItem value="Infantil">Infantil</SelectItem>
              <SelectItem value="Jovenes">Jóvenes</SelectItem>
              <SelectItem value="Adolescentes">Adolescentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 primary-foreground">
                {/* Header with actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {group.name} {group.section}
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <Badge
                        variant={group.status === "Activo" ? "default" : "secondary"}
                        className={group.status === "Activo" ? "bg-green-700 hover:bg-green-800" : ""}
                      >
                        {group.status}
                      </Badge>
                      <Badge variant="outline">{group.ageGroup}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Leader Info */}
                <div className="mb-4 text-sm text-gray-600">
                  <p className="font-medium">Líder: {group.leader.name}</p>
                  <p>{group.leader.email}</p>
                  <p>{group.leader.phone}</p>
                  <p>{group.location}</p>
                </div>

                {/* Stats */}
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{group.stats.scouts}</div>
                    <div className="text-xs text-gray-500">Scout</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{group.stats.insignias}</div>
                    <div className="text-xs text-gray-500">Insignias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{group.stats.activities}</div>
                    <div className="text-xs text-gray-500">Actividades</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progreso General</span>
                    <span className="text-sm font-medium">{group.progress}%</span>
                  </div>
                  <Progress value={group.progress} className="h-2" />
                </div>

                {/* Founded Year */}
                <div className="text-xs text-gray-500">Fundado en {group.foundedYear}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron grupos que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
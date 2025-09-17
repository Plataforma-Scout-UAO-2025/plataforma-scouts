import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import RamaModal from "@/components/modals/RamaModal"
import SubramaModal from "@/components/modals/SubramaModal"
import ConfirmacionModal from "@/components/modals/ConfirmacionModal"
import type { Rama, Subrama } from "@/_mocks/organigramaData"
import { deleteRama, deleteSubrama } from "@/lib/api"

export default function OrganigramaPage() {
  const navigate = useNavigate()

  // Estado para los modales
  const [ramaModalOpen, setRamaModalOpen] = useState(false)
  const [subramaModalOpen, setSubramaModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedRama, setSelectedRama] = useState<Rama | undefined>()
  const [selectedSubrama, setSelectedSubrama] = useState<Subrama | undefined>()
  const [itemToDelete, setItemToDelete] = useState<{type: 'rama' | 'subrama', id: string, name: string} | null>(null)

  // Funciones para manejar las acciones de los modales
  const handleCreateRama = () => {
    setModalMode('create')
    setSelectedRama(undefined)
    setRamaModalOpen(true)
  }

  const handleEditRama = (rama: Rama) => {
    setModalMode('edit')
    setSelectedRama(rama)
    setRamaModalOpen(true)
  }

  const handleDeleteRama = (rama: Rama) => {
    setItemToDelete({type: 'rama', id: rama.id, name: rama.nombre})
    setConfirmModalOpen(true)
  }

  const handleCreateSubrama = () => {
    setModalMode('create')
    setSelectedSubrama(undefined)
    setSubramaModalOpen(true)
  }

  const handleEditSubrama = (subrama: Subrama) => {
    setModalMode('edit')
    setSelectedSubrama(subrama)
    setSubramaModalOpen(true)
  }

  const handleDeleteSubrama = (subrama: Subrama) => {
    setItemToDelete({type: 'subrama', id: subrama.id, name: subrama.nombre})
    setConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      if (itemToDelete.type === 'rama') {
        await deleteRama(itemToDelete.id)
      } else {
        await deleteSubrama(itemToDelete.id)
      }
      console.log(`${itemToDelete.type} eliminada exitosamente`)
    } catch (error) {
      console.error('Error al eliminar:', error)
    } finally {
      setConfirmModalOpen(false)
      setItemToDelete(null)
    }
  }

  const ramas: Rama[] = [
    { 
      id: "1",
      nombre: "Manada", 
      nombreSubramaSingular: "Seisena",
      nombreSubramaPlural: "Seisenas",
      año: 2025,
      descripcion: "Grupo de niños y niñas de 7 a 11 años"
    },
    { 
      id: "2",
      nombre: "Tropa", 
      nombreSubramaSingular: "Patrulla",
      nombreSubramaPlural: "Patrullas",
      año: 2025,
      descripcion: "Jóvenes de 11 a 15 años"
    },
    { 
      id: "3",
      nombre: "Clan", 
      nombreSubramaSingular: "Equipo",
      nombreSubramaPlural: "Equipos",
      año: 2025,
      descripcion: "Jóvenes de 15 a 18 años"
    },
  ]

  const subramas: Subrama[] = [
    { 
      id: "1",
      nombre: "Patrulla de Leones", 
      ramaId: "2",
      año: 2025,
      descripcion: "Patrulla caracterizada por la valentía y el liderazgo"
    },
    { 
      id: "2",
      nombre: "Patrulla de Halcones", 
      ramaId: "2",
      año: 2025,
      descripcion: "Patrulla que representa la agilidad y la visión"
    },
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
              onClick={handleCreateRama}
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
              {ramas.map((rama) => (
                <li
                  key={rama.id}
                  className="flex justify-between items-center border rounded px-3 py-2"
                >
                  <span>{rama.nombre}</span>
                  <div className="flex space-x-2">
                    <Button size="icon" onClick={() => {
                      // Mapear nombres a rutas originales
                      const routeMap: Record<string, string> = {
                        "Manada": "/app/organigrama/detalle-ramaManada",
                        "Tropa": "/app/organigrama/detalle-ramaTropa", 
                        "Clan": "/app/organigrama/detalle-ramaClan"
                      }
                      const route = routeMap[rama.nombre]
                      if (route) navigate(route)
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleEditRama(rama)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDeleteRama(rama)}>
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
              onClick={handleCreateSubrama}
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
              {subramas.map((subrama) => (
                <li
                  key={subrama.id}
                  className="flex justify-between items-center border rounded px-3 py-2"
                >
                  <span>{subrama.nombre}</span>
                  <div className="flex space-x-2">
                    <Button size="icon" onClick={() => {
                      // Mapear nombres a rutas originales
                      const routeMap: Record<string, string> = {
                        "Patrulla de Leones": "/app/organigrama/detalle-subramaPatrullaLeones",
                        "Patrulla de Halcones": "/app/organigrama/detalle-subramaPatrullaHalcones"
                      }
                      const route = routeMap[subrama.nombre]
                      if (route) navigate(route)
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleEditSubrama(subrama)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDeleteSubrama(subrama)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <RamaModal
        isOpen={ramaModalOpen}
        onClose={() => setRamaModalOpen(false)}
        mode={modalMode}
        rama={selectedRama}
        onSuccess={(rama) => {
          console.log('Rama guardada:', rama)
          // Aquí podrías actualizar la lista de ramas
        }}
      />

      <SubramaModal
        isOpen={subramaModalOpen}
        onClose={() => setSubramaModalOpen(false)}
        mode={modalMode}
        subrama={selectedSubrama}
        ramaId="2" // ID de la rama Tropa
        onSuccess={(subrama) => {
          console.log('Subrama guardada:', subrama)
          // Aquí podrías actualizar la lista de subramas
        }}
      />

      <ConfirmacionModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Confirmar Eliminación de ${itemToDelete?.type === 'rama' ? 'Rama' : 'Subrama'}`}
        message={`¿Estás seguro de que quieres eliminar ${itemToDelete?.type === 'rama' ? 'la rama' : 'la subrama'} '${itemToDelete?.name}'?`}
        warningMessage="Esta acción es permanente y no se puede deshacer."
      />
    </div>
  )
}


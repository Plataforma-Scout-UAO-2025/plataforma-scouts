"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  User, Home, Users, Award, Calendar as CalendarIcon, DollarSign,
  HelpCircle, LogOut, ChevronDown, Settings, UserCircle, Group,
  ClipboardCheck
} from "lucide-react"

interface Member {
  id: string
  name: string
}

interface ProgressRecord {
  id: string
  memberId: string
  activity: string
  date: string
  observations?: string
  status: "pending" | "approved"
}

const members: Member[] = [
  { id: "1", name: "Juan Esteban Torres" },
  { id: "2", name: "María González" },
  { id: "3", name: "Carlos Ruiz" },
]

export default function ProgressPage() {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [activity, setActivity] = useState("")
  const [date, setDate] = useState("")
  const [observations, setObservations] = useState("")
  const [records, setRecords] = useState<ProgressRecord[]>([])
  const { toast } = useToast()
  const router = useRouter() // ← Hook para navegación

  const saveProgress = () => {
    if (!selectedMember || !activity || !date) {
      toast({ title: "Error", description: "Por favor, complete todos los datos", duration: 3000 })
      return
    }

    const newRecord: ProgressRecord = {
      id: String(records.length + 1),
      memberId: selectedMember,
      activity,
      date,
      observations,
      status: "pending", // se refleja como "Pendiente de aval"
    }

    setRecords([...records, newRecord])

    toast({
      title: "Registro hecho",
      description: "El progreso se guardó correctamente. (Pendiente de aprobación).",
      duration: 3000,
    })

    setActivity("")
    setDate("")
    setObservations("")
    setSelectedMember("")
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* sidebar */}
      <div className="w-64 bg-green-800 text-white relative">
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Juan Esteban</div>
              <div className="font-semibold text-sm">Torres</div>
              <div className="text-xs text-green-200">MANADA KUNA</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <Award className="w-4 h-4 mr-2" />
                  Mis Insignias
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Mi Calendario
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer" onClick={() => router.push("/")}>
            <Home className="w-5 h-5" />
            <span className="text-sm">Inicio</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <Users className="w-5 h-5" />
            <span className="text-sm">Miembros</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer" onClick={() => router.push("/")}>
            <Award className="w-5 h-5" />
            <span className="text-sm">Insignias</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <Group className="w-5 h-5" />
            <span className="text-sm">Grupos</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm">Eventos</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm">Finanzas</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <Award className="w-5 h-5" />
            <a className="text-sm">Planes de mejora</a>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <ClipboardCheck className="w-5 h-5" />
            <a href="/approvals" className="text-sm">Aprobar Actividades</a>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <ClipboardCheck className="w-5 h-5" />
            <a href="/awards" className="text-sm">Asignar insignias</a>
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 space-y-2">
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Ayuda</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar sesión</span>
          </div>
        </div>
      </div>

      {/* contenido principal */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Planes de mejora</h1>
            <p className="text-gray-600">Aquí podrás registrar y dar seguimiento a tus planes de acción.</p>
          </div>
          <Button variant="outline" className="px-6 bg-transparent" onClick={() => router.push("/")}>
            Atrás
          </Button>
        </div>

        {/* formulario */}
        <Card className="p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">Registrar nuevo avance</h2>

          <div className="space-y-4">
            <div>
              <Label>Miembro</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Actividad / Insignia</Label>
              <Input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Escribe la actividad o insignia"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
            </div>

            <div>
              <Label>Observaciones (opcional)</Label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Escribe observaciones"
                className="mt-2"
              />
            </div>

            <Button onClick={saveProgress} className="bg-green-700 hover:bg-green-800 text-white">
              Guardar avance
            </Button>
          </div>
        </Card>

        {/* registros */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Avances registrados</h2>
          {records.length === 0 ? (
            <p className="text-gray-500">Aún no hay registros.</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => {
                const member = members.find((m) => m.id === r.memberId)
                return (
                  <div key={r.id} className="p-3 border rounded">
                    <p><strong>Miembro:</strong> {member?.name}</p>
                    <p><strong>Actividad:</strong> {r.activity}</p>
                    <p><strong>Fecha:</strong> {r.date}</p>
                    {r.observations && <p><strong>Observaciones:</strong> {r.observations}</p>}
                    <p><strong>Estado:</strong> <span className="text-yellow-600">Pendiente de aprobación</span></p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Toaster />
      </div>
    </div>
  )
}

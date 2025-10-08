"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  User, Home, Users, Award, Calendar as CalendarIcon, DollarSign,
  HelpCircle, LogOut, ChevronDown, Settings, UserCircle, Group,
  ClipboardCheck,
  CheckCircle
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

const initialRecords: ProgressRecord[] = [
  { id: "1", memberId: "1", activity: "Actividad 1", date: "2025-10-03", status: "pending" },
  { id: "2", memberId: "2", activity: "Insignia de Liderazgo", date: "2025-10-02", status: "pending" },
]

export default function ApprovalPage() {
  const [records, setRecords] = useState<ProgressRecord[]>(initialRecords)
  const [selectedRecordId, setSelectedRecordId] = useState<string>("")
  const [comments, setComments] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const approveRecord = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" } : r
      )
    )
    toast({
      title: "Aprobación otorgada",
      description: "La actividad fue aprobada correctamente.",
      duration: 3000,
    })
    setSelectedRecordId("")
    setComments("")
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
                  <ClipboardCheck className="w-4 h-4 mr-2" />
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
            <a href="/progress" className="text-sm">Planes de mejora</a>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <ClipboardCheck className="w-5 h-5" />
            <a className="text-sm">Aprobar Actividades</a>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aprobar Actividades</h1>
            <p className="text-gray-600">Revisa las actividades pendientes y otorga la aprobación.</p>
          </div>
          <Button variant="outline" className="px-6 bg-transparent" onClick={() => router.push("/")}>
            Atrás
          </Button>
        </div>

        <Card className="p-6">
          {records.filter(r => r.status === "pending").length === 0 ? (
            <p className="text-gray-500">No hay actividades pendientes.</p>
          ) : (
            <div className="space-y-4">
              {records.filter(r => r.status === "pending").map((r) => {
                const member = members.find(m => m.id === r.memberId)
                return (
                  <Card key={r.id} className="p-4 border">
                    <p><strong>Miembro:</strong> {member?.name}</p>
                    <p><strong>Actividad:</strong> {r.activity}</p>
                    <p><strong>Fecha:</strong> {r.date}</p>
                    {r.observations && <p><strong>Observaciones:</strong> {r.observations}</p>}

                    <div className="mt-3 space-y-2">
                      <Label>Comentarios (opcional)</Label>
                      <Textarea value={selectedRecordId === r.id ? comments : ""} onChange={(e) => { setSelectedRecordId(r.id); setComments(e.target.value) }} placeholder="Escribe un comentario" className="mt-1" />
                      <Button onClick={() => approveRecord(r.id)} className="bg-green-700 hover:bg-green-800 text-white">
                        Otorgar Aprobación
                      </Button>
                    </div>
                  </Card>
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

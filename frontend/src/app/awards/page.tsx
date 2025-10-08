"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
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
  branch: "Cachorro" | "Manada" | "Webelo" | "Tropa" | "Clan"
}

interface ProgressRecord {
  id: string
  memberId: string
  activity: string
  status: "pending" | "approved"
}

interface AwardRecord {
  id: string
  memberId: string
  award: string
  date: string
  status: "Asignada" | "Entregada"
  responsible: string
}

const members: Member[] = [
  { id: "1", name: "Juan Esteban Torres", branch: "Manada" },
  { id: "2", name: "María González", branch: "Webelo" },
  { id: "3", name: "Carlos Ruiz", branch: "Tropa" },
]

const progressRecords: ProgressRecord[] = [
  { id: "1", memberId: "1", activity: "Actividad 1", status: "approved" },
  { id: "2", memberId: "2", activity: "Actividad 2", status: "approved" },
  { id: "3", memberId: "3", activity: "Actividad 3", status: "pending" },
]

const awardsCatalog = {
  Cachorro: ["Insignia Cachorro 1", "Insignia Cachorro 2"],
  Manada: ["Insignia Manada 1", "Insignia Manada 2"],
  Webelo: ["Insignia Webelo 1", "Insignia Webelo 2"],
  Tropa: ["Insignia Tropa 1", "Insignia Tropa 2"],
  Clan: ["Insignia Clan 1", "Insignia Clan 2"],
}

export default function AssignAwardsPage() {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [selectedAward, setSelectedAward] = useState<string>("")
  const [awardHistory, setAwardHistory] = useState<AwardRecord[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const assignAward = () => {
    if (!selectedMember || !selectedAward) {
      toast({ title: "Error", description: "Seleccione miembro e insignia", duration: 3000 })
      return
    }

    // Validar que el miembro tenga actividades aprobadas
    const approved = progressRecords.some(
      (r) => r.memberId === selectedMember && r.status === "approved"
    )
    if (!approved) {
      toast({ title: "Error", description: "El miembro no tiene actividades avaladas para esta insignia", duration: 3000 })
      return
    }

    const member = members.find((m) => m.id === selectedMember)

    const newAward: AwardRecord = {
      id: String(awardHistory.length + 1),
      memberId: selectedMember,
      award: selectedAward,
      date: new Date().toISOString().split("T")[0],
      status: "Asignada",
      responsible: "Jefe de Rama",
    }

    setAwardHistory([...awardHistory, newAward])
    toast({
      title: "Insignia asignada",
      description: `Se asignó la insignia a ${member?.name}`,
      duration: 3000,
    })

    setSelectedMember("")
    setSelectedAward("")
  }

  const memberAwards = selectedMember ? awardsCatalog[members.find(m => m.id === selectedMember)?.branch || "Cachorro"] : []

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
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
            <a href="/progress" className="text-sm">Planes de mejora</a>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <ClipboardCheck className="w-5 h-5" />
            <a href="/approvals" className="text-sm">Aprobar Actividades</a>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <ClipboardCheck className="w-5 h-5" />
            <a className="text-sm">Asignar insignias</a>
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

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Asignar Insignias</h1>
            <p className="text-gray-600">Selecciona un joven con actividades avaladas y asigna una insignia.</p>
          </div>
          <Button variant="outline" className="px-6 bg-transparent" onClick={() => router.push("/")}>
            Atrás
          </Button>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label>Miembro</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Insignia</Label>
              <Select value={selectedAward} onValueChange={setSelectedAward}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Selecciona una insignia" />
                </SelectTrigger>
                <SelectContent>
                  {memberAwards.map((a, i) => (
                    <SelectItem key={i} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={assignAward} className="bg-green-700 hover:bg-green-800 text-white">
              Asignar Insignia
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Historial de Insignias</h2>
          {awardHistory.length === 0 ? (
            <p className="text-gray-500">Aún no se han asignado insignias.</p>
          ) : (
            <div className="space-y-3">
              {awardHistory.map((a) => {
                const member = members.find(m => m.id === a.memberId)
                return (
                  <div key={a.id} className="p-3 border rounded">
                    <p><strong>Miembro:</strong> {member?.name}</p>
                    <p><strong>Insignia:</strong> {a.award}</p>
                    <p><strong>Fecha:</strong> {a.date}</p>
                    <p><strong>Responsable:</strong> {a.responsible}</p>
                    <p><strong>Estado:</strong> {a.status}</p>
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

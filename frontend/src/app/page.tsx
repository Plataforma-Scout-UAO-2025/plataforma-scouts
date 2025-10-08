"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  X,
  User,
  Home,
  Users,
  Award,
  Group,
  CalendarIcon,
  DollarSign,
  HelpCircle,
  LogOut,
  ChevronDown,
  Settings,
  UserCircle,
  Badge,
  ClipboardCheck,
} from "lucide-react"

interface Badge {
  id: string
  name: string
  icon: string
  progress: number
  description?: string
  requirements?: Requirement[]
}

interface Requirement {
  id: string
  text: string
  completed: boolean
  date?: string
  verifiedBy?: string
}

const badges: Badge[] = [
  {
    id: "webelo",
    name: "Ascenso a Webelo",
    icon: "🏆",
    progress: 70,
    description:
      "Acredita que el niño asimiló las bases teóricas y prácticas del escultismo y es investido como Webelo. Se recomienda entrega en ceremonia por su carácter de hito de incorporación.",
    requirements: [
      {
        id: "1",
        text: "Conoce la Ley, Lema y Máximas",
        completed: true,
        date: "07/08/2023",
        verifiedBy: "José Alberto Gutierrez",
      },
      {
        id: "2",
        text: "Aprende la Promesa y su Significado",
        completed: true,
        date: "13/09/2023",
        verifiedBy: "José Alberto Gutierrez",
      },
      { id: "3", text: "Conoce la historia de Mowgli", completed: false, date: "DD/MM/AAAA", verifiedBy: "" },
    ],
  },
  {
    id: "fortaleza",
    name: "Fortaleza",
    icon: "🌍",
    progress: 70,
    description:
      "Desarrolla la resistencia física y mental necesaria para enfrentar desafíos. Esta insignia reconoce la capacidad de perseverancia y determinación del scout.",
    requirements: [
      {
        id: "f1",
        text: "Completa una caminata de 5 km",
        completed: true,
        date: "15/08/2023",
        verifiedBy: "María González",
      },
      {
        id: "f2",
        text: "Realiza ejercicios de resistencia",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
      {
        id: "f3",
        text: "Demuestra perseverancia en actividades",
        completed: true,
        date: "20/08/2023",
        verifiedBy: "Carlos Ruiz",
      },
    ],
  },
  {
    id: "sabiduria",
    name: "Sabiduría",
    icon: "🐆",
    progress: 70,
    description:
      "Reconoce el desarrollo del conocimiento y la aplicación práctica de habilidades intelectuales en situaciones de la vida scout.",
    requirements: [
      {
        id: "s1",
        text: "Lee 3 libros sobre naturaleza",
        completed: true,
        date: "10/09/2023",
        verifiedBy: "Ana Martínez",
      },
      {
        id: "s2",
        text: "Enseña una habilidad a otro scout",
        completed: true,
        date: "18/09/2023",
        verifiedBy: "Pedro López",
      },
      {
        id: "s3",
        text: "Resuelve problemas en campamento",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
  {
    id: "mistica",
    name: "Mística",
    icon: "🔥",
    progress: 70,
    description:
      "Desarrolla la conexión espiritual y el sentido de propósito dentro del movimiento scout. Fomenta la reflexión y el crecimiento personal.",
    requirements: [
      {
        id: "m1",
        text: "Participa en ceremonia de fogata",
        completed: true,
        date: "25/08/2023",
        verifiedBy: "Roberto Silva",
      },
      {
        id: "m2",
        text: "Reflexiona sobre valores scout",
        completed: true,
        date: "30/08/2023",
        verifiedBy: "Laura Fernández",
      },
      {
        id: "m3",
        text: "Lidera una actividad espiritual",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
  {
    id: "agilidad",
    name: "Agilidad",
    icon: "🏃‍♂️",
    progress: 70,
    description:
      "Desarrolla habilidades físicas de coordinación, velocidad y destreza. Promueve un estilo de vida activo y saludable.",
    requirements: [
      {
        id: "a1",
        text: "Completa circuito de obstáculos",
        completed: true,
        date: "12/09/2023",
        verifiedBy: "Diego Morales",
      },
      {
        id: "a2",
        text: "Practica deportes en equipo",
        completed: true,
        date: "16/09/2023",
        verifiedBy: "Carmen Jiménez",
      },
      {
        id: "a3",
        text: "Demuestra coordinación en juegos",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
  {
    id: "unassigned1",
    name: "Sin Asignación",
    icon: "❓",
    progress: 0,
    description:
      "Esta insignia está disponible para ser asignada. Consulta con tu dirigente para conocer los requisitos específicos.",
    requirements: [
      {
        id: "u1",
        text: "Requisito por definir",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
  {
    id: "unassigned2",
    name: "Sin Asignación",
    icon: "❓",
    progress: 0,
    description:
      "Esta insignia está disponible para ser asignada. Consulta con tu dirigente para conocer los requisitos específicos.",
    requirements: [
      {
        id: "u2",
        text: "Requisito por definir",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
  {
    id: "unassigned3",
    name: "Sin Asignación",
    icon: "❓",
    progress: 0,
    description:
      "Esta insignia está disponible para ser asignada. Consulta con tu dirigente para conocer los requisitos específicos.",
    requirements: [
      {
        id: "u3",
        text: "Requisito por definir",
        completed: false,
        date: "DD/MM/AAAA",
        verifiedBy: "",
      },
    ],
  },
]

export default function BadgesPage() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [progressText, setProgressText] = useState("")
  const [progressDate, setProgressDate] = useState("")
  const [badgesList, setBadgesList] = useState<Badge[]>(badges)
  const { toast } = useToast()

  const openModal = (badge: Badge, openProgressForm = false) => {
    setSelectedBadge(badge)
    setRequirements(badge.requirements || [])
    setShowProgressForm(openProgressForm)
  }

  const closeModal = () => {
    setSelectedBadge(null)
    setRequirements([])
    setShowProgressForm(false)
    setProgressText("")
    setProgressDate("")
  }

  const toggleRequirement = (requirementId: string) => {
    setRequirements((prev) =>
      prev.map((req) => (req.id === requirementId ? { ...req, completed: !req.completed } : req)),
    )
  }

  const showRegisterProgress = () => {
    setShowProgressForm(true)
  }

  const saveProgress = () => {
    if (!selectedBadge || !progressText.trim() || !progressDate) return

    const newProgress = Math.min(selectedBadge.progress + 10, 100)

    setBadgesList((prev) =>
      prev.map((badge) => (badge.id === selectedBadge.id ? { ...badge, progress: newProgress } : badge)),
    )

    setSelectedBadge((prev) => (prev ? { ...prev, progress: newProgress } : null))

    toast({
      title: "¡Avance registrado!",
      description: `Se ha registrado el avance para ${selectedBadge.name}. Progreso actualizado a ${newProgress}%.`,
      duration: 3000,
    })

    setProgressText("")
    setProgressDate("")
    setShowProgressForm(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* sidebar */}
      <div className="w-64 bg-green-800 text-white">
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
                <DropdownMenuItem>
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
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <Home className="w-5 h-5" />
            <span className="text-sm">Inicio</span>
          </div>
          <div className="flex items-center space-x-3 p-2 hover:bg-green-700 rounded cursor-pointer">
            <Users className="w-5 h-5" />
            <span className="text-sm">Miembros</span>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-green-700 rounded">
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Insignias en proceso</h1>
            <p className="text-gray-600">Rama: Tropa | Etapa Actual: Pista de la Aventura</p>
          </div>
          <Button variant="outline" className="px-6 bg-transparent">
            Atrás
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {badgesList.map((badge) => (
            <Card key={badge.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-6xl mb-4">{badge.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-4">{badge.name}</h3>

                <div className="mb-4">
                  <Progress value={badge.progress} className="h-2" />
                  <div className="text-right text-sm text-gray-600 mt-1">{badge.progress}%</div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => openModal(badge, true)}
                >
                  Registrar Avance
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* modal */}
      <Dialog open={!!selectedBadge} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">{selectedBadge?.name}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedBadge && (
            <div className="space-y-6">
              <p className="text-gray-600 text-sm leading-relaxed">{selectedBadge.description}</p>

              <div className="flex justify-center">
                <div className="text-8xl">{selectedBadge.icon}</div>
              </div>

              {showProgressForm && (
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h4 className="font-semibold mb-4 text-lg">Registrar Avance</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="progress-text" className="text-sm font-medium">
                        Descripción del avance
                      </Label>
                      <Textarea
                        id="progress-text"
                        placeholder="Describe el progreso realizado..."
                        value={progressText}
                        onChange={(e) => setProgressText(e.target.value)}
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="progress-date" className="text-sm font-medium">
                        Fecha
                      </Label>
                      <Input
                        id="progress-date"
                        type="date"
                        value={progressDate}
                        onChange={(e) => setProgressDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="outline" onClick={() => setShowProgressForm(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={saveProgress}
                        className="bg-green-700 hover:bg-green-800"
                        disabled={!progressText.trim() || !progressDate}
                      >
                        Guardar Avance
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Lista de Requisitos</h3>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-semibold text-sm">
                      <div>Requisito</div>
                      <div>Fecha</div>
                      <div>Verificado Por</div>
                      <div></div>
                    </div>

                    {requirements.map((req) => (
                      <div key={req.id} className="grid grid-cols-4 gap-4 p-3 border-t items-center">
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={req.completed} onCheckedChange={() => toggleRequirement(req.id)} />
                          <span className="text-sm">{req.text}</span>
                        </div>
                        <div className="text-sm text-gray-600">{req.date}</div>
                        <div className="text-sm text-gray-600">{req.verifiedBy}</div>
                        <div className="flex justify-center">
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {!showProgressForm && (
                  <Button
                    variant="outline"
                    onClick={showRegisterProgress}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Registrar Avance
                  </Button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <Button variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button className="bg-green-700 hover:bg-green-800">Guardar</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

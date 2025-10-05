import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '../components/Sidebar';

// Datos de ejemplo para eventos
const eventosEjemplo = [
  {
    id: 1,
    titulo: "Campamento de Otoño",
    descripcion: "Campamento de fin de semana en la reserva natural La Esperanza",
    fechaInicio: "2025-10-15",
    fechaFin: "2025-10-17",
    hora: "08:00",
    lugar: "Reserva Natural La Esperanza",
    estado: "confirmado",
    participantes: ["José Alberto Gutierrez Jimenez", "Ana María López Hernández"],
    costo: 120000,
    requiereInscripcion: true,
    fechaLimiteInscripcion: "2025-10-10"
  },
  {
    id: 2,
    titulo: "Reunión de Padres",
    descripcion: "Reunión mensual para revisar actividades y próximos eventos",
    fechaInicio: "2025-10-08",
    fechaFin: "2025-10-08",
    hora: "19:00",
    lugar: "Salón Scout - Sede Principal",
    estado: "pendiente",
    participantes: [],
    costo: 0,
    requiereInscripcion: false,
    fechaLimiteInscripcion: null
  },
  {
    id: 3,
    titulo: "Actividad de Servicio Comunitario",
    descripcion: "Jornada de limpieza en el parque del barrio",
    fechaInicio: "2025-10-12",
    fechaFin: "2025-10-12",
    hora: "09:00",
    lugar: "Parque Principal del Barrio",
    estado: "confirmado",
    participantes: ["Luis Fernando Martínez Silva"],
    costo: 0,
    requiereInscripcion: true,
    fechaLimiteInscripcion: "2025-10-09"
  },
  {
    id: 4,
    titulo: "Taller de Nudos y Pionerismo",
    descripcion: "Taller práctico de técnicas scouts básicas",
    fechaInicio: "2025-10-20",
    fechaFin: "2025-10-20",
    hora: "14:00",
    lugar: "Sede Scout",
    estado: "abierto",
    participantes: [],
    costo: 25000,
    requiereInscripcion: true,
    fechaLimiteInscripcion: "2025-10-18"
  }
];

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatearMoneda = (monto: number) => {
  if (monto === 0) return 'Gratuito';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(monto);
};

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case 'confirmado':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>;
    case 'pendiente':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
    case 'abierto':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Abierto</Badge>;
    case 'cancelado':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
};

export default function EventosAcudientes() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const eventosProximos = eventosEjemplo.filter(e => new Date(e.fechaInicio) >= new Date());
  const eventosConfirmados = eventosEjemplo.filter(e => e.estado === 'confirmado').length;

  const handleGoBack = () => {
    window.history.back();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-[#fffaf3]">
      {/* Sidebar - Condicionalmente visible con transición */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-72' : 'w-0'} overflow-hidden`}>
        <Sidebar activeRoute="eventos" />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra "Área de trabajo" */}
        <div className="h-16 bg-[#fffaf3] border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              title={isSidebarVisible ? "Ocultar sidebar" : "Mostrar sidebar"}
            >
              <FolderOpen className="h-5 w-5 text-[#1a4134]" />
            </Button>
            <span className="text-lg font-medium text-[#1a4134]">Área de trabajo</span>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Botón volver */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-[#1a4134] hover:bg-[#1a4134]/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
            </div>

            {/* Header de la vista */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1a4134] mb-3 flex items-center">
                <Calendar className="h-8 w-8 mr-3" />
                Eventos y Actividades
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                Mantente informado sobre los próximos eventos, actividades y reuniones del grupo scout. 
                Aquí encontrarás toda la información necesaria para la participación de tus hijos.
              </p>
            </div>

            {/* Resumen de eventos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1a4134]">{eventosProximos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Eventos programados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{eventosConfirmados}</div>
                  <p className="text-xs text-muted-foreground">
                    Con participación confirmada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1a4134]">{eventosEjemplo.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Actividades en octubre
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de eventos */}
            <div className="grid gap-6">
              {eventosEjemplo.map((evento) => (
                <Card key={evento.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{evento.titulo}</CardTitle>
                          {getEstadoBadge(evento.estado)}
                        </div>
                        <CardDescription className="text-base">
                          {evento.descripcion}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1a4134]">
                          {formatearMoneda(evento.costo)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatearFecha(evento.fechaInicio)}
                            {evento.fechaFin !== evento.fechaInicio && 
                              ` - ${formatearFecha(evento.fechaFin)}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{evento.hora}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{evento.lugar}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {evento.participantes.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Participantes:</p>
                            <ul className="text-sm text-gray-600">
                              {evento.participantes.map((participante, idx) => (
                                <li key={idx}>• {participante}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evento.requiereInscripcion && evento.fechaLimiteInscripcion && (
                          <div className="text-sm text-orange-600">
                            <strong>Fecha límite inscripción:</strong> {formatearFecha(evento.fechaLimiteInscripcion)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
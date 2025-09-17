import {
  Award,
  Calendar,
  CircleCheckBig,
  CircleDollarSign,
  Coins,
  CreditCard,
  CheckCircle,
  User,
  Users,
} from "lucide-react";

export const homeCards = [
  {
    icon: Users,
    label: "Miembros",
    value: "60",
  },
  {
    icon: Calendar,
    label: "Eventos",
    label2: "2 próximos eventos",
    value: "3",
  },
  {
    icon: Award,
    label: "Insignias Completadas",
    label2: "este mes",
    value: "4",
  },
  {
    icon: CircleDollarSign,
    label: "Ingresos Mensuales",
    label2: "+5% que el mes pasado",
    value: "$100.000",
  },
];

export const recentActivities = [
  {
    id: 1,
    icon: User,
    title: "Nuevo miembro registrado: Stefany López",
    time: "Hace 2 horas",
    type: "member",
  },
  {
    id: 2,
    icon: Award,
    title: "Alejandro Cortés completó insignia de Campismo",
    time: "Hace 4 horas",
    type: "badge",
  },
  {
    id: 3,
    icon: Calendar,
    title: 'Evento "Campamento de verano" creado',
    time: "Hace 4 días",
    type: "event",
  },
  {
    id: 4,
    icon: CreditCard,
    title: "Pago recibido de Tomás Torres",
    time: "Hace 2 días",
    type: "payment",
  },
];

export const pendingTasks = [
  {
    id: 1,
    icon: CheckCircle,
    title: "Autorizaciones Pendientes",
    description: "8 autorizaciones esperando aprobación",
    type: "authorization",
    priority: "high",
  },
  {
    id: 2,
    icon: Award,
    title: "Revisar Progreso",
    description: "5 miembros cerca de completar insignias",
    type: "progress",
    priority: "medium",
  },
  {
    id: 3,
    icon: Calendar,
    title: "Próximo Evento",
    description: "Campamento de fin de semana - 15 de Septiembre",
    type: "event",
    priority: "medium",
  },
  {
    id: 4,
    icon: Users,
    title: "Miembros pendientes de aprobación",
    description: "3 nuevos miembros se registraron",
    type: "member",
    priority: "low",
  },
];

export const paymentMetrics = [
  {
    icon: Coins,
    label: "Total Recaudado",
    value: "$450.000",
  },
  {
    icon: CircleDollarSign,
    label: "Pendiente por Cobrar",
    value: "$150.000",
  },
  {
    icon: CircleCheckBig,
    label: "Familias al Día",
    value: "15/20",
  },
  {
    icon: Calendar,
    label: "Familias en Mora",
    value: "5",
  },
];

export const membersData = [
  {
    id: 1,
    firstName: "José Alberto",
    lastName: "Gutierrez Jimenez",
    identification: "CC 11231231902310",
    createdAt: "13 ago 2025 4:30pm",
    status: "Activo",
    city: "Cali",
    branch: "Cachorros",
  },
  {
    id: 2,
    firstName: "María de los Ángeles",
    lastName: "Ruiz Fernández",
    identification: "CC 11231231902310",
    createdAt: "15 jul 2025 4:00pm",
    status: "Activo",
    city: "Jamundí",
    branch: "Lobatos",
  },
  {
    id: 3,
    firstName: "Miguel Ángel",
    lastName: "Tutistar Rosales",
    identification: "CC 11231231902310",
    createdAt: "31 jun 2025 2:10pm",
    status: "Activo",
    city: "Dagua",
    branch: "Webelos",
  },
  {
    id: 4,
    firstName: "Richard Andrés",
    lastName: "Luna Cano",
    identification: "CC 11231231902310",
    createdAt: "05 ago 2025 8:30am",
    status: "Activo",
    city: "Cali",
    branch: "Scout",
  },
  {
    id: 5,
    firstName: "Melany",
    lastName: "Camacho Ordoñez",
    identification: "CC 11231231902310",
    createdAt: "20 jun 2025 9:40am",
    status: "Activo",
    city: "Palmira",
    branch: "Cachorros",
  },
];

export const branchCounts = [
  {
    label: "Miembros",
    value: 60,
  },
  {
    label: "Cachorros",
    value: 10,
  },
  {
    label: "Webelos",
    value: 20,
  },
  {
    label: "Scout",
    value: 10,
  },
  {
    label: "Lobatos",
    value: 20,
  },
];

export const cities = ["Cali", "Jamundí", "Dagua", "Popayan", "Palmira"];

export const eventsData = [
  {
    id: 1,
    name: "Tropical",
    location: "Pance",
    startTime: "4:30 PM",
    date: "25/09/2025",
  },
  {
    id: 2,
    name: "Elementos",
    location: "Playa blanca",
    startTime: "4:30 PM",
    date: "15/10/2025",
  },
  {
    id: 3,
    name: "Campamento de verano",
    location: "Parque Nacional",
    startTime: "10:00 AM",
    date: "20/12/2025",
  },
  {
    id: 4,
    name: "Noche de fogata",
    location: "Parque Central",
    startTime: "7:00 PM",
    date: "25/09/2025",
  },
  {
    id: 5,
    name: "Día de campo",
    location: "Cerro de las Tres Cruces",
    startTime: "8:00 AM",
    date: "30/09/2025",
  },
  {
    id: 6,
    name: "Excursión ecológica",
    location: "Reserva Natural",
    startTime: "9:00 AM",
    date: "10/10/2025",
  },
  {
    id: 7,
    name: "Jornada de servicio comunitario",
    location: "Comunidad Local",
    startTime: "8:00 AM",
    date: "05/11/2025",
  }
];


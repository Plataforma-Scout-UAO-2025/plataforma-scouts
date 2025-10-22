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
    member_id: "1",
    first_name: "José Alberto",
    last_name: "Gutierrez Jimenez",
    identification: "CC 1059901379",
    acceptance_date: "13 ago 2025 4:30pm",
    status: "Activo",
    statusAccount: "En mora",
    city: "Cali",
    branch: "Cachorros",
    orders: [
      {
        orderNumber: "1545848",
        concept: "Excursión",
        value: "$120.000",
        date: "15 de agosto 2025",
        status: "Pendiente",
      },
      {
        orderNumber: "1545849",
        concept: "Uniforme",
        value: "$130.000",
        date: "15 de agosto 2025",
        status: "Pago",
      },
      {
        orderNumber: "1545850",
        concept: "Mensualidad",
        value: "$200.000",
        date: "15 de agosto 2025",
        status: "Pendiente",
      },
    ],
  },
  {
    member_id: "2",
    first_name: "María de los Ángeles",
    last_name: "Ruiz Fernández",
    identification: "CC 11231231902310",
    acceptance_date: "15 jul 2025 4:00pm",
    status: "Activo",
    statusAccount: "Al día",
    city: "Jamundí",
    branch: "Lobatos",
    orders: [
      {
        orderNumber: "1545851",
        concept: "Camiseta",
        value: "$50.000",
        date: "15 de agosto 2025",
        status: "En proceso",
      },
      {
        orderNumber: "1545852",
        concept: "Campamento",
        value: "$170.000",
        date: "15 de agosto 2025",
        status: "Pendiente",
      },
      {
        orderNumber: "1545853",
        concept: "Inscripción",
        value: "$30.000",
        date: "15 de agosto 2025",
        status: "Pago",
      },
    ],
  },
  {
    member_id: "3",
    first_name: "Miguel Ángel",
    last_name: "Tutistar Rosales",
    identification: "CC 11231231902310",
    acceptance_date: "31 jun 2025 2:10pm",
    status: "Activo",
    statusAccount: "Al día",
    city: "Dagua",
    branch: "Webelos",
    orders: [
      {
        orderNumber: "1545854",
        concept: "Uniforme",
        value: "$130.000",
        date: "15 de agosto 2025",
        status: "En proceso",
      },
      {
        orderNumber: "1545855",
        concept: "Mensualidad",
        value: "$200.000",
        date: "15 de agosto 2025",
        status: "Pago",
      },
    ],
  },
  {
    member_id: "4",
    first_name: "Richard Andrés",
    last_name: "Luna Cano",
    identification: "CC 11231231902310",
    acceptance_date: "05 ago 2025 8:30am",
    status: "Activo",
    statusAccount: "En mora",
    city: "Cali",
    branch: "Scout",
    orders: [
      {
        orderNumber: "1545856",
        concept: "Excursión",
        value: "$120.000",
        date: "15 de agosto 2025",
        status: "Pendiente",
      },
      {
        orderNumber: "1545857",
        concept: "Campamento",
        value: "$170.000",
        date: "15 de agosto 2025",
        status: "Pendiente",
      },
    ],
  },
  {
    member_id: "5",
    first_name: "Melany",
    last_name: "Camacho Ordoñez",
    identification: "CC 11231231902310",
    acceptance_date: "20 jun 2025 9:40am",
    status: "Activo",
    statusAccount: "Al día",
    city: "Palmira",
    branch: "Cachorros",
    orders: [
      {
        orderNumber: "1545858",
        concept: "Camiseta",
        value: "$50.000",
        date: "15 de agosto 2025",
        status: "Pago",
      },
      {
        orderNumber: "1545859",
        concept: "Inscripción",
        value: "$30.000",
        date: "15 de agosto 2025",
        status: "En proceso",
      },
    ],
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

export const branches = ["Cachorros", "Lobatos", "Scouts", "Caminantes", "Rovers"];

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
  },
];

export const badgeStats = [
  {
    value: "18",
    label: "Insignias Completadas",
  },
  {
    value: "20",
    label: "En Progreso",
  },
  {
    value: "60",
    label: "Miembros Activos",
  },
];

export const badgeProgressData = [
  {
    memberId: 1,
    memberName: "José Alberto Gutierrez Jimenez",
    branch: "Scout",
    age: 18,
    completedBadges: 0,
    totalBadges: 6,
    badges: [
      {
        id: 1,
        name: "Expresión artística",
        description: "Conocimientos básicos de arte y expresión",
        progress: 80,
        status: "En Progreso",
      },
      {
        id: 2,
        name: "Espíritu Scout",
        description: "Conocimientos básicos de escultismo y campamento",
        progress: 60,
        status: "En Progreso",
      },
      {
        id: 3,
        name: "Académica y de Comunicación",
        description: "Desarrollo académico y liderazgo con enfoque ambiental",
        progress: 90,
        status: "En Progreso",
      },
      {
        id: 4,
        name: "Salud y Bienestar",
        description: "Conocimientos sobre salud y bienestar",
        progress: 100,
        status: "Completado",
      },
    ],
  },
  {
    memberId: 2,
    memberName: "María de los Ángeles Ruiz Fernández",
    branch: "Lobatos",
    age: 17,
    completedBadges: 2,
    totalBadges: 5,
    badges: [
      {
        id: 1,
        name: "Liderazgo",
        description: "Desarrollo de habilidades de liderazgo",
        progress: 40,
        status: "En Progreso",
      },
      {
        id: 2,
        name: "Trabajo en equipo",
        description: "Fomentar el trabajo en equipo y la colaboración",
        progress: 60,
        status: "En Progreso",
      },
      {
        id: 3,
        name: "Comunicación",
        description: "Mejorar las habilidades de comunicación",
        progress: 90,
        status: "En Progreso",
      },
    ],
  },
  {
    memberId: 3,
    memberName: "Miguel Ángel Tutistar Rosales",
    branch: "Webelos",
    age: 16,
    completedBadges: 1,
    totalBadges: 4,
    badges: [
      {
        id: 1,
        name: "Naturaleza",
        description: "Conocimientos sobre flora y fauna",
        progress: 25,
        status: "En Progreso",
      },
      {
        id: 2,
        name: "Supervivencia",
        description: "Técnicas de supervivencia en la naturaleza",
        progress: 50,
        status: "En Progreso",
      },
      {
        id: 3,
        name: "Exploración",
        description: "Habilidades de exploración y orientación",
        progress: 75,
        status: "En Progreso",
      },
    ],
  },
];

export const filesData = [
  {
    id: "1",
    name: "Manual Scout Centinelas 113.pdf",
    type: "file" as const,
    size: 2500000, // 2.5MB
    uploadDate: "2025-09-20T10:30:00Z",
    uploadedBy: "Admin Principal",
    category: "documentos" as const,
    description: "Manual oficial del grupo scout",
    fileType: "pdf",
    url: "/files/manual-scout.pdf",
  },
  {
    id: "2",
    name: "Formularios",
    type: "folder" as const,
    uploadDate: "2025-09-15T14:20:00Z",
    uploadedBy: "Admin Principal",
    category: "formularios" as const,
    description: "Carpeta con todos los formularios oficiales",
  },
  {
    id: "3",
    name: "Autorizacion Campamento.docx",
    type: "file" as const,
    size: 156000, // 156KB
    uploadDate: "2025-09-18T09:15:00Z",
    uploadedBy: "María González",
    category: "formularios" as const,
    description: "Formato de autorización para campamentos",
    fileType: "docx",
    url: "/files/autorizacion-campamento.docx",
    parentId: "2",
  },
  {
    id: "4",
    name: "Fotos Campamento Verano 2025",
    type: "folder" as const,
    uploadDate: "2025-08-25T16:45:00Z",
    uploadedBy: "Carlos Ruiz",
    category: "imagenes" as const,
    description: "Fotografías del campamento de verano",
  },
  {
    id: "5",
    name: "IMG_001.jpg",
    type: "file" as const,
    size: 3200000, // 3.2MB
    uploadDate: "2025-08-25T16:50:00Z",
    uploadedBy: "Carlos Ruiz",
    category: "imagenes" as const,
    description: "Ceremonia de apertura del campamento",
    fileType: "jpg",
    url: "/files/img_001.jpg",
    parentId: "4",
  },
  {
    id: "6",
    name: "Reglamento Interno 2025.pdf",
    type: "file" as const,
    size: 890000, // 890KB
    uploadDate: "2025-09-10T11:20:00Z",
    uploadedBy: "Admin Principal",
    category: "documentos" as const,
    description: "Reglamento interno actualizado para 2025",
    fileType: "pdf",
    url: "/files/reglamento-2025.pdf",
  },
  {
    id: "7",
    name: "Presentacion Padres de Familia.pptx",
    type: "file" as const,
    size: 15600000, // 15.6MB
    uploadDate: "2025-09-12T15:30:00Z",
    uploadedBy: "Ana Martínez",
    category: "presentaciones" as const,
    description: "Presentación para reunión de padres de familia",
    fileType: "pptx",
    url: "/files/presentacion-padres.pptx",
  },
  {
    id: "8",
    name: "Video Actividades Scouts.mp4",
    type: "file" as const,
    size: 45000000, // 45MB
    uploadDate: "2025-09-05T13:10:00Z",
    uploadedBy: "Diego López",
    category: "videos" as const,
    description: "Video promocional de actividades del grupo",
    fileType: "mp4",
    url: "/files/video-actividades.mp4",
  },
  {
    id: "9",
    name: "Inventario Materiales.xlsx",
    type: "file" as const,
    size: 78000, // 78KB
    uploadDate: "2025-09-08T08:45:00Z",
    uploadedBy: "Luis Fernández",
    category: "otros" as const,
    description: "Inventario de materiales y equipos del grupo",
    fileType: "xlsx",
    url: "/files/inventario-materiales.xlsx",
  },
];

export const fileStats = {
  totalFiles: 7,
  totalSize: 69374000, // ~69MB
  categoryCounts: {
    documentos: 2,
    formularios: 1,
    imagenes: 1,
    videos: 1,
    presentaciones: 1,
    otros: 1,
  },
};

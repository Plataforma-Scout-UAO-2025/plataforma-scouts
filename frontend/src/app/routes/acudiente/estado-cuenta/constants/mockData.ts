import type { AcudienteData, EstadoCuentaData } from "../types/estadoCuenta.type";

// Datos mock para el estado de cuenta del hijo 1 (Juan Pérez)
const estadoCuentaJuan: EstadoCuentaData = {
  cuotas: [
    {
      id: "cuota-1",
      nombre: "Cuota mensual Scouts - Enero",
      monto: "50000",
      periodicidad: "Mensual",
      fechaLimitePago: "2024-01-28",
      estado: "Pagada",
      medioPago: "PSE",
      aplicaA: "Scouts"
    },
    {
      id: "cuota-2",
      nombre: "Cuota mensual Scouts - Febrero",
      monto: "50000",
      periodicidad: "Mensual",
      fechaLimitePago: "2024-02-28",
      estado: "Pendiente",
      medioPago: "PSE",
      aplicaA: "Scouts"
    },
    {
      id: "cuota-3",
      nombre: "Campamento de Verano",
      monto: "200000",
      periodicidad: "Única",
      fechaLimitePago: "2024-03-15",
      estado: "Pendiente",
      medioPago: "Cualquiera",
      aplicaA: "Scouts"
    },
    {
      id: "cuota-4",
      nombre: "Cuota mensual Scouts - Diciembre",
      monto: "50000",
      periodicidad: "Mensual",
      fechaLimitePago: "2023-12-28",
      estado: "Vencida",
      medioPago: "PSE",
      aplicaA: "Scouts"
    }
  ],
  pagos: [
    {
      id: "pago-1",
      cuotaId: "cuota-1",
      concepto: "Cuota mensual Scouts - Enero",
      monto: "50000",
      fechaPago: "2024-01-15",
      medioPago: "PSE",
      estado: "Pagado"
    }
  ],
  resumen: {
    totalPendiente: 300000, // 50000 + 200000 + 50000 (vencida)
    totalPagado: 50000,
    cuotasVencidas: 1,
    proximoVencimiento: "2024-02-28"
  }
};

// Datos mock para el estado de cuenta del hijo 2 (María García)
const estadoCuentaMaria: EstadoCuentaData = {
  cuotas: [
    {
      id: "cuota-5",
      nombre: "Cuota trimestral Lobatos - Q1",
      monto: "150000",
      periodicidad: "Trimestral",
      fechaLimitePago: "2024-03-31",
      estado: "Pendiente",
      medioPago: "Efectivo",
      aplicaA: "Lobatos"
    },
    {
      id: "cuota-6",
      nombre: "Cuota trimestral Lobatos - Q4 2023",
      monto: "150000",
      periodicidad: "Trimestral",
      fechaLimitePago: "2023-12-31",
      estado: "Pagada",
      medioPago: "Efectivo",
      aplicaA: "Lobatos"
    }
  ],
  pagos: [
    {
      id: "pago-2",
      cuotaId: "cuota-6",
      concepto: "Cuota trimestral Lobatos - Q4 2023",
      monto: "150000",
      fechaPago: "2023-12-20",
      medioPago: "Efectivo",
      estado: "Pagado"
    }
  ],
  resumen: {
    totalPendiente: 150000,
    totalPagado: 150000,
    cuotasVencidas: 0,
    proximoVencimiento: "2024-03-31"
  }
};

// Datos mock para el estado de cuenta del hijo 3 (Ana López)
const estadoCuentaAna: EstadoCuentaData = {
  cuotas: [
    {
      id: "cuota-7",
      nombre: "Cuota anual Rovers 2024",
      monto: "300000",
      periodicidad: "Anual",
      fechaLimitePago: "2024-12-31",
      estado: "Pendiente",
      medioPago: "PSE",
      aplicaA: "Rovers"
    }
  ],
  pagos: [],
  resumen: {
    totalPendiente: 300000,
    totalPagado: 0,
    cuotasVencidas: 0,
    proximoVencimiento: "2024-12-31"
  }
};

// Datos mock del acudiente con sus hijos
export const mockAcudienteData: AcudienteData = {
  id: "acudiente-1",
  nombre: "Carlos Rodríguez",
  email: "carlos.rodriguez@email.com",
  telefono: "+57 300 123 4567",
  hijos: [
    {
      id: "hijo-1",
      nombre: "Juan Pérez",
      rama: "Scouts",
      edad: 15,
      estadoCuenta: estadoCuentaJuan
    },
    {
      id: "hijo-2", 
      nombre: "María García",
      rama: "Lobatos",
      edad: 13,
      estadoCuenta: estadoCuentaMaria
    },
    {
      id: "hijo-3",
      nombre: "Ana López", 
      rama: "Rovers",
      edad: 18,
      estadoCuenta: estadoCuentaAna
    }
  ]
};


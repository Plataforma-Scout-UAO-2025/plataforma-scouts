export type CuotaConEstado = {
  id: string;
  nombre: string;
  monto: string;
  periodicidad: string;
  fechaLimitePago: string;
  estado: "Pendiente" | "Pagada" | "Vencida";
  medioPago: string;
  aplicaA: string;
};

export type PagoRealizado = {
  id: string;
  cuotaId: string;
  concepto: string;
  monto: string;
  fechaPago: string;
  medioPago: string;
  estado: "Pagado" | "Pendiente" | "Cancelado";
};

export type EstadoCuentaData = {
  cuotas: CuotaConEstado[];
  pagos: PagoRealizado[];
  resumen: {
    totalPendiente: number;
    totalPagado: number;
    cuotasVencidas: number;
    proximoVencimiento?: string;
  };
};

export type Hijo = {
  id: string;
  nombre: string;
  rama: string;
  edad: number;
  estadoCuenta: EstadoCuentaData;
};

export type AcudienteData = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  hijos: Hijo[];
};


import { useEffect, useState } from "react";
import PagosTable from "./components/PagosTable";
import type { Pago } from "./types/pago.type";
import { Loader2 } from "lucide-react";

// Datos mock para pagos
const mockPagos: Pago[] = [
  {
    id: "1",
    concepto: "Cuota mensual Scouts",
    monto: "50000",
    fechaPago: "2024-01-15",
    estado: "Pagado",
    medioPago: "PSE",
    cuotaId: "cuota-1",
    scoutId: "scout-1"
  },
  {
    id: "2",
    concepto: "Cuota trimestral Lobatos",
    monto: "150000",
    fechaPago: "2024-01-20",
    estado: "Pendiente",
    medioPago: "Efectivo",
    cuotaId: "cuota-2",
    scoutId: "scout-2"
  },
  {
    id: "3",
    concepto: "Pago extraordinario Campamento",
    monto: "200000",
    fechaPago: "2024-01-25",
    estado: "Pagado",
    medioPago: "Tarjeta de Crédito",
    cuotaId: "cuota-3",
    scoutId: "scout-3"
  },
  {
    id: "4",
    concepto: "Cuota anual Rovers",
    monto: "300000",
    fechaPago: "2024-02-01",
    estado: "Pagado",
    medioPago: "PSE",
    cuotaId: "cuota-4",
    scoutId: "scout-4"
  },
  {
    id: "5",
    concepto: "Cuota mensual Scouts",
    monto: "50000",
    fechaPago: "2024-02-15",
    estado: "Pendiente",
    medioPago: "Otro",
    cuotaId: "cuota-1",
    scoutId: "scout-5"
  }
];

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      // Simular llamada a API con datos mock
      setPagos(mockPagos);
      setLoading(false);
    };
    fetchPagos();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Gestión de Pagos
          </h1>
          <p className="text-muted-foreground text-sm">
            En esta sección puedes visualizar todos los pagos realizados por los
            miembros del grupo scout, incluyendo el estado de cada pago, el medio
            de pago utilizado y la información detallada de cada transacción.
          </p>
        </div>
      </div>
      <PagosTable pagos={pagos} />
      {loading && (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

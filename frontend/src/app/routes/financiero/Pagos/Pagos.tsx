import { useEffect, useState } from "react";
import PagosTable from "./components/PagosTable";
import type { PaymentRecord } from "@/types/pago.type";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";

export default function Pagos() {
  const [pagos, setPagos] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const tenantId = useTenant();

  useEffect(() => {
    const fetchPagos = async () => {
      // Simular llamada a API con datos mock
      try {
        const response = await api.get("/finanzas/payments/members/" + tenantId);
        setPagos(response.data);
      } catch {
        toast.error("Error al obtener los pagos");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, [tenantId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Pagos agrupados por integrante
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

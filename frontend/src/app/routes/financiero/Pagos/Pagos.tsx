import { useEffect, useState } from "react";
import PagosTable from "./components/PagosTable";
import type { PaymentRecord } from "@/types/pago.type";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";
import ReporteModal from "../Reportes/components/ReporteModal";
import type { FiltrosReporte } from "@/types/reporte-financiero.type";
import { useNavigate } from "react-router-dom";

export default function Pagos() {
  const [pagos, setPagos] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const tenantId = useTenant();
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

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

  const handleGenerarReporte = (filtros: FiltrosReporte) => {
    // Crear URL con parámetros para navegar a reportes
    const params = new URLSearchParams({
      scope: filtros.generated_for === "MEMBER" ? "SCOUT" : filtros.generated_for === "SUBGROUP" ? "SUBGROUP" : "SECTION",
      associatedToId: filtros.id,
      start_date: filtros.start_date,
      end_date: filtros.end_date
    });
    
    // Navegar a la página de reportes con los parámetros
    navigate(`/app/financiero/pagos/reportes?${params.toString()}`);
  };

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

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
      <PagosTable pagos={pagos} onGenerarReporte={handleAbrirModal} />
      {loading && (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      <ReporteModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        onGenerarReporte={handleGenerarReporte}
      />
    </div>
  );
}

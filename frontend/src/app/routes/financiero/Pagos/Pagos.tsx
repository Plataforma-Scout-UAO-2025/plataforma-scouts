import { useEffect, useState } from "react";
import PagosTable from "./components/PagosTable";
import type { PaymentRecord } from "@/types/pago.type";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import ReporteModal from "../Reportes/components/ReporteModal";
import type { FiltrosReporte } from "@/types/reporte-financiero.type";
import { useNavigate } from "react-router-dom";


export default function Pagos() {
  const [pagos, setPagos] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagos = async () => {
      // Simular llamada a API con datos mock
      try {
        const response = await api.get("/finanzas/payments/members/" + "org_6B3k4dao2Wf6eGxa");
        setPagos(response.data);
      } catch {
        toast.error("Error al obtener los pagos");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);

  const handleGenerarReporte = (filtros: FiltrosReporte) => {
    // Crear URL con parámetros para navegar a reportes
    const params = new URLSearchParams({
      scope: filtros.scope,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin
    });
    
    // Agregar parámetros de asociado si existe
    if (filtros.associated_to) {
      params.append('associatedToId', filtros.associated_to.id);
      params.append('associatedToName', filtros.associated_to.name);
    }
    
    // Navegar a la página de reportes con los parámetros
    navigate(`/app/financiero/reportes?${params.toString()}`);
  };

  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

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

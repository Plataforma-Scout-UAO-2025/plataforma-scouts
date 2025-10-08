import { useEffect, useState, useCallback } from "react";
import CuotasTable from "./components/CuotasTable";
import type { Cuota } from "@/types/cuota.type";
import api from "@/api/axios";
import { Loader2 } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Gestion() {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenantId } = useTenant();
  const navigate = useNavigate();

  const fetchCuotas = useCallback(async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}finanzas/fees/${tenantId}`
      );

      if (response.status === 200) {
        // Transformar las fechas de string a Date objects
        const cuotasData: Cuota[] = response.data.map((cuota: {
          fee_id: string;
          amount: number;
          name: string;
          description: string;
          periodicity: Cuota["periodicity"];
          scope: Cuota["scope"];
          start_date: string;
          end_date?: string | null;
          associated_to: { id: string; name: string } | null;
        }) => ({
          ...cuota,
          start_date: new Date(cuota.start_date),
          end_date: cuota.end_date ? new Date(cuota.end_date) : undefined,
        }));
        setCuotas(cuotasData);
      } else if (response.status === 401) {
        toast.error("No tienes permisos para acceder a esta sección");
        navigate("/app/dashboard");
      } else {
        toast.error("Error al cargar las cuotas");
        console.error("Error al cargar las cuotas:", response.data);
      }
    } catch (error) {
      toast.error("Error al cargar las cuotas");
      console.error("Error al cargar las cuotas:", error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, navigate]);

  useEffect(() => {
    fetchCuotas();
  }, [fetchCuotas]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Cuotas básicas de grupo
          </h1>
          <p className="text-muted-foreground text-sm">
            En esta sección el tesorero puede definir las cuotas financieras del
            grupo scout, estableciendo el monto a pagar, la periodicidad de
            cobro (mensual, trimestral, semestral, anual) y las condiciones
            aplicables según el tipo de miembro, edad, rama o excepciones
            definidas por el grupo.
          </p>
        </div>
      </div>
      <CuotasTable cuotas={cuotas} onRefresh={fetchCuotas} />
      {loading && (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

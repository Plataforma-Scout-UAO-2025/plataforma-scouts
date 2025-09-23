import { useEffect, useState } from "react";
import CuotasTable from "./components/CuotasTable";
import type { Cuota } from "./types/cuota.type";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function Gestion() {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuotas = async () => {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "finanzas/cuotas"
      );
      setCuotas(response.data);
      setLoading(false);
    };
    fetchCuotas();
  }, []);

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
      <CuotasTable cuotas={cuotas} />
      {loading && (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

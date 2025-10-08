import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EstadoCuentaTable from "./components/EstadoCuentaTable";
import ResumenEstadoCuenta from "./components/ResumenEstadoCuenta";
import type { EstadoCuentaData } from "./types/estadoCuenta.type";
import { mockAcudienteData } from "./constants/mockData";

export default function EstadoCuenta() {
  const [selectedHijo, setSelectedHijo] = useState<string>("");
  const [estadoCuentaData, setEstadoCuentaData] = useState<EstadoCuentaData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simular acudiente actual (en producción vendría del contexto de autenticación)
  const acudienteActual = mockAcudienteData;

  useEffect(() => {
    // Seleccionar automáticamente el primer hijo si no hay ninguno seleccionado
    if (acudienteActual.hijos.length > 0 && !selectedHijo) {
      setSelectedHijo(acudienteActual.hijos[0].id);
    }
  }, [acudienteActual.hijos, selectedHijo]);

  useEffect(() => {
    const fetchEstadoCuenta = async () => {
      if (!selectedHijo) return;

      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const hijo = acudienteActual.hijos.find(h => h.id === selectedHijo);
      if (hijo) {
        setEstadoCuentaData(hijo.estadoCuenta);
      }
      
      setLoading(false);
    };

    fetchEstadoCuenta();
  }, [selectedHijo, acudienteActual]);

  const hijoSeleccionado = acudienteActual.hijos.find(h => h.id === selectedHijo);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Estado de Cuenta
          </h1>
          <p className="text-muted-foreground text-sm">
            Consulta el estado financiero de tus hijos, incluyendo cuotas pendientes, 
            pagos realizados y el historial completo de transacciones.
          </p>
        </div>

        {/* Selector de Hijo */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Seleccionar hijo:
          </label>
          <Select
            value={selectedHijo}
            onValueChange={setSelectedHijo}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecciona un hijo" />
            </SelectTrigger>
            <SelectContent>
              {acudienteActual.hijos.map((hijo) => (
                <SelectItem key={hijo.id} value={hijo.id}>
                  {hijo.nombre} - {hijo.rama} ({hijo.edad} años)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando estado de cuenta...</span>
          </div>
        ) : estadoCuentaData && hijoSeleccionado ? (
          <div className="space-y-8">
            {/* Resumen */}
            <ResumenEstadoCuenta 
              hijo={hijoSeleccionado}
              estadoCuenta={estadoCuentaData}
            />
            
            {/* Tabla de Cuotas y Pagos */}
            <EstadoCuentaTable 
              cuotas={estadoCuentaData.cuotas}
              pagos={estadoCuentaData.pagos}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No se encontró información para el hijo seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


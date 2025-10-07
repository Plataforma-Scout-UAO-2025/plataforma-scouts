import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstadoCuenta, CuotasEstado } from "@/types/estado-cuenta.type";
import ResumenEstadoCuenta from "./components/ResumenEstadoCuenta";
import { mockTesoreroData, mockAcudienteData } from "./constants/mockData";
import EstadoCuentaTable from "./components/EstadoCuentaTable";
import { useRoleContext } from "@/hooks/useRoleContext";
import { RawRole } from "@/roles/roles";
// import api from "@/api/axios";

export default function EstadoCuenta() {
  const { currentUserRole } = useRoleContext();
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [estadoCuentaData, setEstadoCuentaData] = useState<EstadoCuenta | null>(null);
  const [loading, setLoading] = useState(true);

  const isTesorero = currentUserRole === RawRole.TESORERO;

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchEstadoCuenta = async () => {
      setLoading(true);

      try {
        // BACKEND: Cuando el backend esté disponible, descomentar esto
        /*
        const orgId = "org_6B3k4dao2Wf6eGxa";
        let endpoint = `/finanzas/payments/account-status/${orgId}`;
        
        if (!isTesorero) {
          // Para acudiente, agregar el ID (quemado a 1 por ahora)
          endpoint += "/1";
        }

        const response = await api.get<EstadoCuenta>(endpoint);
        setEstadoCuentaData(response.data);
        
        // Si es acudiente y hay members, seleccionar el primero automáticamente
        if (!isTesorero && response.data.members && response.data.members.length > 0) {
          setSelectedMemberId(response.data.members[0].member_id);
        }
        */

        // MOCK: Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData = isTesorero ? mockTesoreroData : mockAcudienteData;
        setEstadoCuentaData(mockData);

        // Si es acudiente y hay members, seleccionar el primero automáticamente
        if (!isTesorero && mockData.members && mockData.members.length > 0) {
          setSelectedMemberId(mockData.members[0].member_id);
        }
      } catch (error) {
        console.error("Error al cargar estado de cuenta:", error);
        setEstadoCuentaData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadoCuenta();
  }, [isTesorero]);

  // Filtrar cuotas por miembro seleccionado (solo para acudiente)
  const cuotasFiltradas = useMemo<CuotasEstado[]>(() => {
    if (!estadoCuentaData) return [];
    
    // Si es tesorero, mostrar todas las cuotas
    if (isTesorero) {
      return estadoCuentaData.cuotas;
    }

    // Si es acudiente, filtrar por miembro seleccionado
    if (!selectedMemberId) return [];

    const memberSelected = estadoCuentaData.members?.find(
      (m) => m.member_id === selectedMemberId
    );

    if (!memberSelected) return [];

    return estadoCuentaData.cuotas.filter(
      (cuota) => cuota.member_name === memberSelected.member_name
    );
  }, [estadoCuentaData, selectedMemberId, isTesorero]);

  // Miembro seleccionado (solo para acudiente)
  const memberSeleccionado = useMemo(() => {
    if (isTesorero || !estadoCuentaData?.members) return null;
    return estadoCuentaData.members.find((m) => m.member_id === selectedMemberId);
  }, [estadoCuentaData, selectedMemberId, isTesorero]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Estado de Cuenta
          </h1>
          <p className="text-muted-foreground text-sm">
            {isTesorero
              ? "Vista global del estado financiero del grupo, incluyendo cuotas pendientes y pagos realizados por todos los integrantes."
              : "Consulta el estado financiero de tus hijos, incluyendo cuotas pendientes, pagos realizados y el historial completo de transacciones."}
          </p>
        </div>

        {/* Selector de Hijo (solo para acudiente) */}
        {!isTesorero && estadoCuentaData?.members && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Seleccionar hijo:
            </label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecciona un hijo" />
              </SelectTrigger>
              <SelectContent>
                {estadoCuentaData.members.map((member) => (
                  <SelectItem key={member.member_id} value={member.member_id}>
                    {member.member_name} - {member.section.name} ({member.age} años)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Cargando estado de cuenta...
            </span>
          </div>
        ) : estadoCuentaData ? (
          <div className="space-y-8">
            {/* Resumen */}
            <ResumenEstadoCuenta
              kpis={estadoCuentaData.kpis}
              member={memberSeleccionado}
            />

            {/* Tabla de Cuotas */}
            <EstadoCuentaTable cuotas={cuotasFiltradas} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No se encontró información del estado de cuenta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

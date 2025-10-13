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
import EstadoCuentaTable from "./components/EstadoCuentaTable";
import { useRoleContext } from "@/hooks/useRoleContext";
import { RawRole } from "@/roles/roles";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";

export default function EstadoCuenta() {
  const { currentUserRole } = useRoleContext();
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [estadoCuentaData, setEstadoCuentaData] = useState<EstadoCuenta | null>(null);
  const [loading, setLoading] = useState(true);

  const isTesorero = currentUserRole === RawRole.TESORERO;
  const isAcudiente = currentUserRole === RawRole.ACUDIENTE;
  const isAdminGrupo = currentUserRole === RawRole.ADMIN_GRUPO;
  const isTesoreroOrAdmin = isTesorero || isAdminGrupo;
  // Obtener el tenantId
  const tenantId = useTenant();

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchEstadoCuenta = async () => {
      setLoading(true);

      try {   
        let endpoint = `/finanzas/payments/status/${tenantId}`;
        
        if (!isTesoreroOrAdmin) {
          // Para acudiente, agregar el ID (quemado a 83 por ahora)
          endpoint += "/83";
        }

        const response = await api.get<EstadoCuenta>(endpoint);
        setEstadoCuentaData(response.data);
        
        // Si es acudiente y hay members, seleccionar el primero automáticamente
        if (isAcudiente && response.data?.members && response.data.members.length > 0) {
          setSelectedMemberId(response.data.members[0].member_id);
        }
      
      } catch (error) {
        console.error("Error al cargar estado de cuenta:", error);
        setEstadoCuentaData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadoCuenta();
  }, [isTesoreroOrAdmin, isAcudiente, tenantId]);

  // Filtrar cuotas por miembro seleccionado (solo para acudiente)
  const cuotasFiltradas = useMemo<CuotasEstado[]>(() => {
    if (!estadoCuentaData) return [];
    
    const firstData = estadoCuentaData;
    
    // Si es tesorero o admin de grupo, mostrar todas las cuotas
    if (isTesoreroOrAdmin) {
      return firstData.cuotas;
    }

    // Si es acudiente, filtrar por miembro seleccionado
    if (!selectedMemberId) return [];

    const memberSelected = firstData.members?.find(
      (m) => m.member_id === selectedMemberId
    );

    if (!memberSelected) return [];

    return firstData.cuotas.filter(
      (cuota) => cuota.member_name === memberSelected.member_name
    );
  }, [estadoCuentaData, selectedMemberId, isTesoreroOrAdmin]);

  // Miembro seleccionado (solo para acudiente)
  const memberSeleccionado = useMemo(() => {
    if (isTesoreroOrAdmin || !estadoCuentaData) return null;
    const firstData = estadoCuentaData;
    if (!firstData.members) return null;
    return firstData.members.find((m) => m.member_id === selectedMemberId);
  }, [estadoCuentaData, selectedMemberId, isTesoreroOrAdmin]);

  return (
    <div className="p-0 mx-0">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Estado de Cuenta
          </h1>
          <p className="text-muted-foreground text-sm">
            {isTesoreroOrAdmin
              ? "Vista global del estado financiero del grupo, incluyendo cuotas pendientes y pagos realizados por todos los integrantes."
              : "Consulta el estado financiero de tus personas a cargo, incluyendo cuotas pendientes, pagos realizados y el historial completo de transacciones."}
          </p>
        </div>

        {/* Selector de Hijo (solo para acudiente) */}
        {!isTesoreroOrAdmin && estadoCuentaData && estadoCuentaData.members && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Seleccionar persona a cargo:
            </label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecciona una persona a cargo" />
              </SelectTrigger>
              <SelectContent>
                {estadoCuentaData.members.map((member) => (
                  <SelectItem key={member.member_id} value={member.member_id}>
                    {member.member_name} - {member.section.name} {
                      member.age ? `(${member.age} años)` : ""
                    }
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
              kpis={{
                total_pendiente: estadoCuentaData.kpis.total_pendiente,
                total_pagado: estadoCuentaData.kpis.total_pagado,
                cuotas_vencidas: estadoCuentaData.kpis.cuotas_vencidas,
              }}
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

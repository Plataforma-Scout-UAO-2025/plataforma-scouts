import { useEffect, useState } from "react";
import * as service from "../services/niveles.service";
import type { OrganigramaNiveles, Nivel, Cargo } from "../types/niveles.types";

/**
 * Hook de estado/acciones para el Organigrama de Niveles.
 * - Carga por año
 * - CRUD de Niveles y Cargos
 * - Helpers para togglear visibilidad
 */
export function useNiveles(anioInicial: number, tenantId?: string, groupSlug?: string) {
  const [anio, setAnio] = useState(anioInicial);
  const [data, setData] = useState<OrganigramaNiveles>({
    anio: anioInicial,
    niveles: [],
  });
  const [loading, setLoading] = useState(true);

  // =========================
  // Carga inicial / por año
  // =========================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
  const d = await service.getByAnio(anio, tenantId, groupSlug); // Carga los datos desde backend (secciones/subgrupos) con overrides
        if (mounted) setData(d);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [anio, tenantId, groupSlug]);

  // Util: recargar desde el backend y setear estado
  const refresh = async () => {
    const d = await service.getByAnio(anio, tenantId, groupSlug);
    setData(d);
  };

  // =========================
  // NIVELES
  // =========================

  /**
   * Crea un nivel (visible por defecto).
   */
  const addNivel = async (nombre: string, descripcion?: string) => {
    if (!(tenantId && groupSlug)) return;
    await service.createNivel(tenantId, groupSlug, nombre, descripcion);
    await refresh();
  };

  /**
   * Actualiza un nivel (nombre/descripcion/visible/cargos...).
   */
  const updateNivel = async (nivel: Nivel) => {
    await service.upsertNivel(anio, nivel, tenantId, groupSlug);
    await refresh();
  };

  /**
   * Elimina un nivel por id.
   */
  const removeNivel = async (nivelId: string) => {
    await service.deleteNivel(anio, nivelId, tenantId, groupSlug);
    await refresh();
  };

  /**
   * Toggle de visibilidad del nivel (helper).
   */
  const toggleNivelVisible = async (nivelId: string) => {
    const nivel = data.niveles.find((n) => n.id === nivelId);
    if (!nivel) return;
    await updateNivel({ ...nivel, visible: !nivel.visible });
  };

  // =========================
  // CARGOS
  // =========================

  /**
   * Crea un cargo dentro de un nivel.
   */
  const addCargo = async (
    nivelId: string,
    nombre: string,
    _titular?: string,
    descripcion?: string
  ) => {
    if (!(tenantId && groupSlug)) return;
    await service.createCargo(tenantId, groupSlug, nivelId, nombre, descripcion);
    await refresh();
  };

  /**
   * Actualiza un cargo perteneciente a un nivel.
   */
  const updateCargo = async (nivelId: string, cargo: Cargo) => {
    await service.upsertCargo(anio, nivelId, cargo, tenantId, groupSlug);
    await refresh();
  };

  /**
   * Elimina un cargo de un nivel.
   */
  const removeCargo = async (nivelId: string, cargoId: string) => {
    await service.deleteCargo(anio, nivelId, cargoId, tenantId, groupSlug);
    await refresh();
  };

  /**
   * Toggle de visibilidad de un cargo (helper).
   */
  const toggleCargoVisible = async (nivelId: string, cargoId: string) => {
    const nivel = data.niveles.find((n) => n.id === nivelId);
    if (!nivel) return;
    const cargo = nivel.cargos.find((c) => c.id === cargoId);
    if (!cargo) return;
    await updateCargo(nivelId, { ...cargo, visible: !cargo.visible });
  };

  return {
    // estado
    anio,
    setAnio,
    data,
    loading,

    // niveles
    addNivel,
    updateNivel,
    removeNivel,
    toggleNivelVisible,

    // cargos
    addCargo,
    updateCargo,
    removeCargo,
    toggleCargoVisible,

    // util
    refresh,
  };
}

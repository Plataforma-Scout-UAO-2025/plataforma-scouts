import { useEffect, useState } from "react";
import * as service from "../services/niveles.service";
import type { OrganigramaNiveles, Nivel, Cargo } from "../types/niveles.types";

export function useNiveles(anioInicial: number) {
  const [anio, setAnio] = useState(anioInicial);
  const [data, setData] = useState<OrganigramaNiveles>({ anio: anioInicial, niveles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    service.getByAnio(anio).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [anio]);

  const addNivel = async (nombre: string) => {
    const nivel: Nivel = { id: crypto.randomUUID(), nombre, visible: true, cargos: [] };
    await service.upsertNivel(anio, nivel);
    setData(await service.getByAnio(anio));
  };

  const updateNivel = async (nivel: Nivel) => {
    await service.upsertNivel(anio, nivel);
    setData(await service.getByAnio(anio));
  };

  const removeNivel = async (nivelId: string) => {
    await service.deleteNivel(anio, nivelId);
    setData(await service.getByAnio(anio));
  };

  const addCargo = async (nivelId: string, nombre: string, titular?: string) => {
    const cargo: Cargo = { id: crypto.randomUUID(), nombre, titular, visible: true };
    await service.upsertCargo(anio, nivelId, cargo);
    setData(await service.getByAnio(anio));
  };

  const updateCargo = async (nivelId: string, cargo: Cargo) => {
    await service.upsertCargo(anio, nivelId, cargo);
    setData(await service.getByAnio(anio));
  };

  const removeCargo = async (nivelId: string, cargoId: string) => {
    await service.deleteCargo(anio, nivelId, cargoId);
    setData(await service.getByAnio(anio));
  };

  return { anio, setAnio, data, loading, addNivel, updateNivel, removeNivel, addCargo, updateCargo, removeCargo };
}

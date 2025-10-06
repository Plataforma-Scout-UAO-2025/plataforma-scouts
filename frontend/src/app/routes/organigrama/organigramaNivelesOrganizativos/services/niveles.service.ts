import { loadAll, saveAll } from "./niveles.storage";
import { nivelesMock2024, nivelesMock2025 } from "./niveles.mocks";
import type { OrganigramaNiveles, Nivel, Cargo } from "../types/niveles.types";

function ensureSeed() {
  const all = loadAll();
  if (!all["2025"]) all["2025"] = nivelesMock2025;
  if (!all["2024"]) all["2024"] = nivelesMock2024;
  saveAll(all);
}

ensureSeed();

export async function getByAnio(anio: number): Promise<OrganigramaNiveles> {
  const all = loadAll();
  if (all[String(anio)]) return structuredClone(all[String(anio)]);
  const nuevo: OrganigramaNiveles = { anio, niveles: [] };
  all[String(anio)] = nuevo;
  saveAll(all);
  return structuredClone(nuevo);
}

export async function upsertNivel(anio: number, nivel: Nivel): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)] || { anio, niveles: [] };
  const idx = data.niveles.findIndex(n => n.id === nivel.id);
  if (idx >= 0) data.niveles[idx] = nivel; else data.niveles.push(nivel);
  all[String(anio)] = data;
  saveAll(all);
}

export async function deleteNivel(anio: number, nivelId: string): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)];
  if (!data) return;
  data.niveles = data.niveles.filter(n => n.id !== nivelId);
  all[String(anio)] = data;
  saveAll(all);
}

export async function upsertCargo(anio: number, nivelId: string, cargo: Cargo): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)];
  if (!data) return;
  const nivel = data.niveles.find(n => n.id === nivelId);
  if (!nivel) return;
  const idx = nivel.cargos.findIndex(c => c.id === cargo.id);
  if (idx >= 0) nivel.cargos[idx] = cargo; else nivel.cargos.push(cargo);
  all[String(anio)] = data;
  saveAll(all);
}

export async function deleteCargo(anio: number, nivelId: string, cargoId: string): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)];
  if (!data) return;
  const nivel = data.niveles.find(n => n.id === nivelId);
  if (!nivel) return;
  nivel.cargos = nivel.cargos.filter(c => c.id !== cargoId);
  all[String(anio)] = data;
  saveAll(all);
}

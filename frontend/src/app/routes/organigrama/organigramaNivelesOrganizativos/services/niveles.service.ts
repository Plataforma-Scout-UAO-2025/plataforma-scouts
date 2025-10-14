import { loadAll, saveAll } from "./niveles.storage";
import { nivelesMock2024, nivelesMock2025 } from "./niveles.mocks";
import type { OrganigramaNiveles, Nivel, Cargo } from "../types/niveles.types";

/* ============================================================
   🔹 Inicialización de datos (seed)
   ============================================================ */
function ensureSeed() {
  const all = loadAll();
  if (!all["2025"]) all["2025"] = nivelesMock2025;
  if (!all["2024"]) all["2024"] = nivelesMock2024;
  saveAll(all);
}

ensureSeed();

/**
 * Forzar reseed: limpia el storage y vuelve a sembrar los mocks definidos.
 * Útil en desarrollo cuando los mocks cambian y ya existen datos en localStorage.
 */
export function resetSeed() {
  // limpiar todos los datos guardados y resembrar
  try {
    // Import lazy para evitar ciclos en tiempo de módulo
    // usar la función clearAll exportada desde storage
    try {
      // dynamic import para evitar el require
      // (se hace de forma async vía then para mantener API sync-like)
      import("./niveles.storage")
        .then((storage) => {
          const maybeClear = (storage as unknown as Record<string, unknown>)['clearAll'];
          if (typeof maybeClear === 'function') {
            try {
              (maybeClear as (...args: unknown[]) => unknown)();
            } catch (errClear) {
              console.debug('resetSeed: clearAll failed', errClear);
            }
          }
        })
  .catch(() => {
          // fallback trying global
          try {
            const maybeGlobal = (globalThis as unknown as Record<string, unknown> | undefined) ?? undefined;
            const globalClear = maybeGlobal && maybeGlobal['clearAll'];
            if (typeof globalClear === 'function') {
              try { (globalClear as (...args: unknown[]) => unknown)(); } catch (errClear) { console.debug('resetSeed: global clearAll failed', errClear); }
            }
          } catch (_errFallback) {
            console.debug('resetSeed: dynamic import and fallback both failed', _errFallback);
          }
        });
    } catch (err) {
      // handled by dynamic import fallback above; log for visibility
      console.debug('resetSeed: unexpected error in resetSeed', err);
    }
  } catch (err) {
    // Si require falla, intentamos llamar a la función directamente (caso tests/ESM)
    console.debug('resetSeed: outer require catch (ignored) -', err);
  }

  ensureSeed();
}

/* ============================================================
   🔹 Obtener datos por año
   ============================================================ */
export async function getByAnio(anio: number): Promise<OrganigramaNiveles> {
  const all = loadAll();

  // Si ya existen datos en storage
  if (all[String(anio)]) return structuredClone(all[String(anio)]);

  // Si no existen, cargamos los mocks para 2024 y 2025
  let dataToSave: OrganigramaNiveles;
  if (anio === 2025) dataToSave = nivelesMock2025;
  else if (anio === 2024) dataToSave = nivelesMock2024;
  else dataToSave = { anio, niveles: [] }; // Estructura vacía para otros años

  all[String(anio)] = dataToSave;
  saveAll(all);

  return structuredClone(dataToSave);
}

/* ============================================================
   🔹 CRUD Niveles
   ============================================================ */
export async function upsertNivel(anio: number, nivel: Nivel): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)] || { anio, niveles: [] };
  const idx = data.niveles.findIndex(n => n.id === nivel.id);
  if (idx >= 0) data.niveles[idx] = nivel;
  else data.niveles.push(nivel);
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

/* ============================================================
   🔹 CRUD Cargos
   ============================================================ */
export async function upsertCargo(anio: number, nivelId: string, cargo: Cargo): Promise<void> {
  const all = loadAll();
  const data: OrganigramaNiveles = all[String(anio)];
  if (!data) return;
  const nivel = data.niveles.find(n => n.id === nivelId);
  if (!nivel) return;
  const idx = nivel.cargos.findIndex(c => c.id === cargo.id);
  if (idx >= 0) nivel.cargos[idx] = cargo;
  else nivel.cargos.push(cargo);
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

import type { OrganigramaNiveles, Nivel, Cargo } from "../types/niveles.types";
import {
  getSections,
  getSubgroups,
  createSection,
  updateSection,
  deleteSection,
  createSubgroup,
  updateSubgroup,
  deleteSubgroup,
} from "@/api/organigramaApi";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";

// Nota: el almacenamiento local funciona ahora como "overrides" locales sobre los datos del backend.
// resetSeed ya no aplica: datos provienen del backend
export function resetSeed() { /* noop */ }

/* ============================================================
   🔹 Obtener datos por año
   ============================================================ */
export async function getByAnio(anio: number, tenantId?: string, groupSlug?: string): Promise<OrganigramaNiveles> {
  // Datos desde backend usando secciones/subgrupos
  if (!(tenantId && groupSlug)) return { anio, niveles: [] };

  const sections = await getSections(tenantId, groupSlug);
  const normalize = (s: string) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // Consideramos "niveles organizativos" a nombres que contengan estas palabras clave
  const isOrganizationalLevel = (name: string) => {
    const n = normalize(name);
    return n.includes('comit') || n.includes('asamblea') || n.includes('corte') || n.includes('consejo');
  };
  const organizationalSections = (sections || []).filter((s: Section) => isOrganizationalLevel(String(s.name || '')));

  const niveles: Nivel[] = [];
  for (const s of organizationalSections) {
    const subgroups = await getSubgroups(s.sectionId, tenantId, groupSlug);
    const cargos: Cargo[] = (subgroups || []).map((sg: Subgroup) => ({
      id: String(sg.subgroupId ?? sg.id),
      nombre: String(sg.name || ''),
      visible: true,
      descripcion: sg.description ?? undefined,
    }));
    niveles.push({
      id: String(s.sectionId ?? s.id),
      nombre: String(s.name || ''),
      visible: true,
      descripcion: s.description ?? undefined,
      cargos,
    });
  }
  return { anio, niveles };
}

/* ============================================================
   🔹 CRUD Niveles
   ============================================================ */
export async function createNivel(tenantId: string, groupSlug: string, nombre: string, descripcion?: string): Promise<void> {
  // Respetar el nombre tal como lo ingresa el usuario (sin prefijos automáticos)
  await createSection({ name: nombre, description: descripcion ?? undefined } as any, tenantId, groupSlug);
}

export async function upsertNivel(_anio: number, nivel: Nivel, tenantId?: string, groupSlug?: string): Promise<void> {
  // Para compatibilidad: si tenemos tenant/grupo, actualizamos sección; si no, no-op
  if (tenantId && groupSlug) {
    await updateSection(nivel.id, { name: nivel.nombre, description: nivel.descripcion ?? undefined } as any, tenantId, groupSlug);
  }
}

export async function deleteNivel(_anio: number, nivelId: string, tenantId?: string, groupSlug?: string): Promise<void> {
  if (tenantId && groupSlug) {
    await deleteSection(nivelId, tenantId, groupSlug);
  }
}

/* ============================================================
   🔹 CRUD Cargos
   ============================================================ */
export async function createCargo(tenantId: string, groupSlug: string, nivelId: string, nombre: string, descripcion?: string): Promise<void> {
  await createSubgroup(nivelId, { name: nombre, description: descripcion ?? undefined } as any, tenantId, groupSlug);
}

export async function upsertCargo(_anio: number, nivelId: string, cargo: Cargo, tenantId?: string, groupSlug?: string): Promise<void> {
  if (tenantId && groupSlug) {
    await updateSubgroup(nivelId, cargo.id, { name: cargo.nombre, description: cargo.descripcion ?? undefined } as any, tenantId, groupSlug);
  }
}

export async function deleteCargo(_anio: number, nivelId: string, cargoId: string, tenantId?: string, groupSlug?: string): Promise<void> {
  if (tenantId && groupSlug) {
    await deleteSubgroup(nivelId, cargoId, tenantId, groupSlug);
  }
}

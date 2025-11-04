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

// Normaliza texto: quita acentos/diacríticos, pasa a minúsculas y recorta
function normalizeText(str: string): string {
  return String(str || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/* ============================================================
   🔹 Obtener datos por año
   ============================================================ */
export async function getByAnio(anio: number, tenantId?: string, groupSlug?: string): Promise<OrganigramaNiveles> {
  // Datos desde backend usando secciones/subgrupos
  if (!(tenantId && groupSlug)) return { anio, niveles: [] };

  const sections = await getSections(tenantId, groupSlug);

  // Excluir nombres específicos de niveles organizativos (coincidencia parcial, insensible a mayúsculas)
  const EXCLUDED_LEVEL_TOKENS = [
    "cachorros",
    "manada",
    "webelos",
    "tropa",
    "clan",
  ];
  const EXCLUDED_LEVEL_TOKENS_NORM = EXCLUDED_LEVEL_TOKENS.map(normalizeText);

  // Filtrar y ordenar secciones (niveles) alfabéticamente
  const filteredSections = (sections || []).filter((sec: Section) => {
    const nombre = normalizeText(sec.name || "");
    return !EXCLUDED_LEVEL_TOKENS_NORM.some((token) => nombre.includes(token));
  });
  const sortedSections = filteredSections.sort((a: Section, b: Section) => {
    const an = normalizeText(a.name || "");
    const bn = normalizeText(b.name || "");
    return an.localeCompare(bn, 'es', { sensitivity: 'base' });
  });

  const niveles: Nivel[] = [];
  for (const s of sortedSections) {
    const subgroups = await getSubgroups(s.sectionId, tenantId, groupSlug);
    const cargos: Cargo[] = (subgroups || [])
      .map((sg: Subgroup) => ({
        id: String(sg.subgroupId ?? sg.id),
        nombre: String(sg.name || ''),
        visible: true,
        descripcion: sg.description ?? undefined,
      }))
      .sort((a: Cargo, b: Cargo) => {
        const an = normalizeText(a.nombre);
        const bn = normalizeText(b.nombre);
        const SIN = 'sin cargo';
        if (an === SIN && bn === SIN) return 0;
        if (an === SIN) return 1; // a debe ir al final
        if (bn === SIN) return -1; // b debe ir al final
        return an.localeCompare(bn, 'es', { sensitivity: 'base' });
      });
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
  await createSection({ name: nombre, description: descripcion ?? undefined } as Omit<Section, 'id' | 'sectionId' | 'groupId' | 'createdAt' | 'updatedAt'>, tenantId, groupSlug);
}

export async function upsertNivel(_anio: number, nivel: Nivel, tenantId?: string, groupSlug?: string): Promise<void> {
  // Para compatibilidad: si tenemos tenant/grupo, actualizamos sección; si no, no-op
  if (tenantId && groupSlug) {
    await updateSection(nivel.id, { name: nivel.nombre, description: nivel.descripcion ?? undefined } as Partial<Section>, tenantId, groupSlug);
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
  await createSubgroup(nivelId, { name: nombre, description: descripcion ?? undefined } as Omit<Subgroup, 'id' | 'subgroupId' | 'tenantId' | 'groupId' | 'sectionId' | 'createdAt' | 'updatedAt'>, tenantId, groupSlug);
}

export async function upsertCargo(_anio: number, nivelId: string, cargo: Cargo, tenantId?: string, groupSlug?: string): Promise<void> {
  if (tenantId && groupSlug) {
    await updateSubgroup(nivelId, cargo.id, { name: cargo.nombre, description: cargo.descripcion ?? undefined } as Partial<Subgroup>, tenantId, groupSlug);
  }
}

export async function deleteCargo(_anio: number, nivelId: string, cargoId: string, tenantId?: string, groupSlug?: string): Promise<void> {
  if (tenantId && groupSlug) {
    await deleteSubgroup(nivelId, cargoId, tenantId, groupSlug);
  }
}

import type {
  Branch as Rama,
  CreateBranchData as CreateRamaData,
  UpdateBranchData as UpdateRamaData,
  Subgroup as Subrama,
} from "../types/frontend";

import {
  getSections,
  getSection,
  getSubgroups,
  createSection,
  updateSection,
  deleteSection,
} from "@/api/organigramaApi";
import {
  mapBackendRamaToFrontend,
  mapFrontendCreateRamaToBackend,
  mapFrontendUpdateRamaToBackend,
  mapBackendSubramaToFrontend,
} from "../utils/mappers";
import { getSubramasByRamaId } from "./subrama.service";
import {
  uploadSectionIcon,
  uploadGalleryImages,
} from "../../services/imageFacade";
import type { Section as SectionDTO } from "@/types/section-simple.type";
import type { Subgroup as SubgroupDTO } from "@/types/subgroup-simple.type";

type GetRamasOpts = { año?: number; signal?: AbortSignal } | number | undefined;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const pickId = (
  source: Record<string, unknown>,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const candidate = source[key];
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }
  return undefined;
};

const resolveSectionId = (
  section: SectionDTO | undefined
): string | undefined => {
  if (!section) return undefined;
  const record = toRecord(section);
  return pickId(record, ["sectionId", "section_id", "id", "ID"]);
};

const resolveSubgroupSectionId = (
  subgroup: SubgroupDTO | undefined
): string | undefined => {
  if (!subgroup) return undefined;
  const record = toRecord(subgroup);
  return pickId(record, ["sectionId", "section_id"]);
};

export const getRamasWithSubramas = async (
  tenantId: string,
  groupSlug: string,
  añoOrOpts?: GetRamasOpts
): Promise<Rama[]> => {
  try {
    let opts: GetRamasOpts = añoOrOpts;
    if (typeof añoOrOpts === "number") opts = { año: añoOrOpts };
    return await getRamas(tenantId, groupSlug, opts);
  } catch (error) {
    console.error(" [RamaService] Error en flujo estándar:", error);
    throw error;
  }
};

export const getRamas = async (
  tenantId: string,
  groupSlug: string,
  añoOrOpts?: GetRamasOpts
): Promise<Rama[]> => {
  try {
    const backendRamas = (await getSections(
      tenantId,
      groupSlug
    )) as SectionDTO[];

    let año: number | undefined = undefined;
    if (typeof añoOrOpts === "number") año = añoOrOpts;
    else if (typeof añoOrOpts === "object" && añoOrOpts !== null) {
      const opts = añoOrOpts as { año?: number; signal?: AbortSignal };
      año = opts.año;
    }

    const ramas = (Array.isArray(backendRamas) ? backendRamas : []).map(
      mapBackendRamaToFrontend
    );

    const resolveRamaId = (rama: Rama): string => {
      const idCandidates = [
        rama.sectionId,
        (rama as unknown as Record<string, unknown>)["section_id"],
        rama.id,
        (rama as unknown as Record<string, unknown>)["ramaId"],
      ];
      return (
        idCandidates
          .map((candidate) =>
            typeof candidate === "string"
              ? candidate.trim()
              : candidate !== undefined && candidate !== null
              ? String(candidate)
              : ""
          )
          .find((candidate) => candidate.length > 0) ?? ""
      );
    };

    const ramasConSubramas = await Promise.all(
      ramas.map(async (rama) => {
        const normalizedId = resolveRamaId(rama);

        if (!normalizedId) {
          console.warn(
            " [RamaService] Rama sin ID válido, se omite la carga de subramas.",
            {
              nombre: rama.nombre ?? rama.name,
            }
          );
          const ramaSinId: Rama = { ...rama, subgroups: [], subramas: [] };
          const ramaSinIdAny = ramaSinId as unknown as Record<string, unknown>;
          ramaSinIdAny.subramas = [];
          ramaSinIdAny.section_id = undefined;
          return ramaSinId;
        }

        const attachAliases = (target: Rama, subgroups: Subrama[]) => {
          const anyTarget = target as unknown as Record<string, unknown>;
          anyTarget.subramas = subgroups;
          anyTarget.section_id = target.sectionId ?? normalizedId;
          anyTarget.galleryObjectUrls = target.galleryObjectIds ?? [];
          anyTarget.sectionGalleryObjectIds = target.galleryObjectIds ?? [];
        };

        try {
          // Usar endpoint de solo subgrupos para evitar datos duplicados
          const subgroups = (await getSubgroups(
            normalizedId,
            tenantId,
            groupSlug
          )) as SubgroupDTO[];

          const mappedSubgrupos = (subgroups ?? []).map(
            (subgroup: SubgroupDTO) =>
              mapBackendSubramaToFrontend({
                ...subgroup,
                sectionId: resolveSubgroupSectionId(subgroup) ?? normalizedId,
              } as SubgroupDTO)
          );

          const hydratedRama: Rama = {
            ...rama,
            id: String(normalizedId),
            sectionId: String(normalizedId),
            subgroups: mappedSubgrupos,
          };

          attachAliases(hydratedRama, mappedSubgrupos);
          return hydratedRama;
        } catch (error) {
          console.warn(
            ` [RamaService] No se pudieron cargar subgrupos via with-subgroups para ${
              rama.nombre ?? rama.name
            }. Se usa fallback.`,
            error
          );
          try {
            const subramas = await getSubramasByRamaId(
              tenantId,
              groupSlug,
              normalizedId
            );
            const fallbackRama: Rama = {
              ...rama,
              id: String(normalizedId),
              sectionId: String(normalizedId),
              subgroups: subramas,
            };
            attachAliases(fallbackRama, subramas);
            return fallbackRama;
          } catch (subramaError) {
            console.warn(
              ` [RamaService] Fallback también falló para ${
                rama.nombre ?? rama.name
              }:`,
              subramaError
            );
            const emptyRama: Rama = {
              ...rama,
              id: String(normalizedId),
              sectionId: String(normalizedId),
              subgroups: [],
            };
            attachAliases(emptyRama, []);
            return emptyRama;
          }
        }
      })
    );

    const ramasFiltradas = año
      ? ramasConSubramas.filter((rama: Rama) => {
          const legacy = rama as unknown as Record<string, unknown>;
          const year = rama.year ?? (legacy["año"] as number | undefined);
          return year === año;
        })
      : ramasConSubramas;

    return ramasFiltradas;
  } catch (error: unknown) {
    console.error(" [RamaService] Error obteniendo ramas:", error);
    const errorWithResponse = error as { response?: { data?: unknown } };
    if (errorWithResponse?.response) {
      console.error(
        " [RamaService] response.data:",
        errorWithResponse.response?.data
      );
    }
    throw error;
  }
};

export const getRamaById = async (
  tenantId: string,
  groupSlug: string,
  id: string
): Promise<Rama | null> => {
  try {
    const normalizedId = String(id);

    try {
      // Usar patrón optimizado: getSection + getSubgroups en lugar de getSectionWithSubgroups
      const [canonicalSection, subgroups] = await Promise.all([
        getSection(normalizedId, tenantId, groupSlug) as Promise<SectionDTO>,
        getSubgroups(normalizedId, tenantId, groupSlug) as Promise<
          SubgroupDTO[]
        >,
      ]);

      if (canonicalSection) {
        const canonicalRama = mapBackendRamaToFrontend(canonicalSection);
        const canonicalSectionId =
          resolveSectionId(canonicalSection) ?? normalizedId;
        const mappedSubgrupos = (subgroups ?? []).map((subgroup: SubgroupDTO) =>
          mapBackendSubramaToFrontend({
            ...subgroup,
            sectionId: resolveSubgroupSectionId(subgroup) ?? canonicalSectionId,
          } as SubgroupDTO)
        );

        canonicalRama.id = String(canonicalSectionId);
        canonicalRama.sectionId = String(canonicalSectionId);
        canonicalRama.subgroups = mappedSubgrupos;

        const canonicalRamaAny = canonicalRama as unknown as Record<
          string,
          unknown
        >;
        canonicalRamaAny.subramas = mappedSubgrupos;
        canonicalRamaAny.section_id = canonicalRama.sectionId;
        canonicalRamaAny.galleryObjectUrls =
          canonicalRama.galleryObjectIds ?? [];
        canonicalRamaAny.sectionGalleryObjectIds =
          canonicalRama.galleryObjectIds ?? [];

        return canonicalRama;
      }
    } catch (withSubgroupsError) {
      console.warn(
        ` [RamaService] with-subgroups no disponible para rama ${id}, se usa endpoint estándar.`,
        withSubgroupsError
      );
    }

    const backendRama = (await getSection(
      id,
      tenantId,
      groupSlug
    )) as SectionDTO;
    const rama = mapBackendRamaToFrontend(backendRama as SectionDTO);
    rama.id = rama.id || normalizedId;
    rama.sectionId = rama.sectionId ?? normalizedId;

    try {
      const subramas = await getSubramasByRamaId(tenantId, groupSlug, rama.id);
      rama.subramas = subramas;
      rama.subgroups = subramas;
    } catch (subramaError) {
      console.warn(
        ` [RamaService] No se pudieron cargar subramas para rama ${rama.nombre}:`,
        subramaError
      );
      rama.subramas = [];
      rama.subgroups = [];
    }

    return rama;
  } catch (error) {
    console.error(" [RamaService] Error obteniendo rama por ID:", error);
    const e = error as {
      response?: { data?: unknown };
      config?: { url?: string };
    };
    if (e.config?.url)
      console.error(" [RamaService] request url:", e.config.url);
    if (e.response?.data)
      console.error(" [RamaService] response.data:", e.response.data);
    return null;
  }
};

export const createRama = async (
  tenantId: string,
  groupSlug: string,
  data: CreateRamaData
): Promise<Rama> => {
  try {
    const backendData = mapFrontendCreateRamaToBackend(data);
    const payload = {
      ...backendData,
      tenantId,
    };

    const backendRama = (await createSection(
      payload,
      tenantId,
      groupSlug
    )) as SectionDTO;

    const sectionId = resolveSectionId(backendRama) ?? "";

    if (data.iconFile && sectionId) {
      await uploadSectionIcon(tenantId, groupSlug, sectionId, data.iconFile);
    } else {
      // no icon to upload
    }

    if (data.galleryFiles && data.galleryFiles.length > 0 && sectionId) {
      await uploadGalleryImages(
        tenantId,
        groupSlug,
        sectionId,
        data.galleryFiles
      );
    }

    if (
      sectionId &&
      (data.iconFile || (data.galleryFiles && data.galleryFiles.length > 0))
    ) {
      const updatedRama = await getRamaById(tenantId, groupSlug, sectionId);
      if (updatedRama) {
        return updatedRama;
      }
    }

    const rama = mapBackendRamaToFrontend(backendRama);
    return rama;
  } catch (error) {
    console.error(" [RamaService] Error creando rama:", error);
    throw error;
  }
};

export const updateRama = async (
  tenantId: string,
  groupSlug: string,
  data: UpdateRamaData
): Promise<Rama | null> => {
  try {
    const backendData = mapFrontendUpdateRamaToBackend(data);

    const backendRama = (await updateSection(
      data.id,
      backendData,
      tenantId,
      groupSlug
    )) as SectionDTO;

    if (data.iconFile) {
      await uploadSectionIcon(tenantId, groupSlug, data.id, data.iconFile);
    }

    if (data.galleryFiles && data.galleryFiles.length > 0) {
      await uploadGalleryImages(
        tenantId,
        groupSlug,
        data.id,
        data.galleryFiles
      );
    }

    const rama = mapBackendRamaToFrontend(backendRama);
    return rama;
  } catch (error) {
    console.error(" [RamaService] Error actualizando rama:", error);
    throw error;
  }
};

export const deleteRama = async (
  tenantId: string,
  groupSlug: string,
  id: string
): Promise<boolean> => {
  try {
    await deleteSection(id, tenantId, groupSlug);
    return true;
  } catch (error) {
    console.error(" [RamaService] Error eliminando rama:", error);
    return false;
  }
};

export const getAvailableYears = async (
  tenantId: string,
  groupSlug: string
): Promise<number[]> => {
  try {
    const backendRamas = (await getSections(
      tenantId,
      groupSlug
    )) as SectionDTO[];
    const ramasSimples = (Array.isArray(backendRamas) ? backendRamas : []).map(
      mapBackendRamaToFrontend
    );
    const years = [
      ...new Set(
        ramasSimples
          .map((r: Rama) => {
            const legacy = r as unknown as Record<string, unknown>;
            return r.year ?? (legacy["año"] as number | undefined);
          })
          .filter((y: number | undefined) => y !== undefined && y !== null)
      ),
    ] as number[];
    const sortedYears = years.sort((a: number, b: number) => b - a);

    return sortedYears;
  } catch (error: unknown) {
    console.error(" [RamaService] Error obteniendo años:", error);
    const errorWithResponse = error as { response?: { data?: unknown } };
    if (errorWithResponse?.response) {
      console.error(
        " [RamaService] response.data (años):",
        errorWithResponse.response?.data
      );
    }
    return [];
  }
};

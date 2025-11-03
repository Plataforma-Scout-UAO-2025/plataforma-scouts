import type { Branch as Rama } from '../types/frontend';

/**
 * Normaliza una cadena de texto para comparación
 */
const normalize = (s: string): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Filtra solo ramas scout que empiecen con las categorías tradicionales
 * Muestra TODAS las ramas de cada categoría (no solo una por categoría)
 */
export const filterScoutBranches = (ramas: Rama[]): Rama[] => {
  const categorias = ["cachorros", "manada", "webelos", "tropa", "clan"];

  return ramas.filter((rama) => {
    const n = normalize(String(rama.name || rama.nombre || ""));
    return categorias.some((cat) => n.startsWith(cat));
  });
};

/**
 * Ordena ramas según el orden scout tradicional
 * Primero por categoría (cachorros, manada, webelos, tropa, clan)
 * Luego alfabéticamente dentro de cada categoría
 */
export const sortRamas = (ramas: Rama[]): Rama[] => {
  const ordenRamas = ["cachorros", "manada", "webelos", "tropa", "clan"];

  return ramas.sort((a, b) => {
    const nameA = String(a.name || a.nombre || "").toLowerCase();
    const nameB = String(b.name || b.nombre || "").toLowerCase();

    const indexA = ordenRamas.findIndex((orden) => nameA.startsWith(orden));
    const indexB = ordenRamas.findIndex((orden) => nameB.startsWith(orden));

    if (indexA !== -1 && indexB !== -1) {
      if (indexA !== indexB) {
        return indexA - indexB; // Diferentes categorías
      }
      // Misma categoría, ordenar alfabéticamente
      return nameA.localeCompare(nameB);
    }

    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return nameA.localeCompare(nameB);
  });
};

/**
 * Procesa datos de ramas: filtra y ordena según estándares scout
 */
export const processRamasData = (ramas: Rama[]): Rama[] => {
  const filtered = filterScoutBranches(ramas);
  return sortRamas(filtered);
};

/**
 * Utility para debounce de funciones
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => unknown>(
  func: T,
  wait: number
): T & { cancel: () => void } => {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

/**
 * Constantes de configuración
 */
export const CACHE_CONFIG = {
  RAMAS_TTL: 30 * 1000, // 30 segundos
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 200, // ms
  DEBOUNCE_DELAY: 100, // ms
} as const;
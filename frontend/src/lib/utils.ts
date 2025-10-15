import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convierte keys snake_case a camelCase de forma recursiva
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const deepCamelize = (obj: unknown): unknown => {
  if (Array.isArray(obj)) return obj.map(deepCamelize);
  if (obj && typeof obj === 'object') {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const nk = toCamel(k);
      (res as Record<string, unknown>)[nk] = deepCamelize(v);
    }
    return res;
  }
  return obj;
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { // Combina clases condicionales y resuelve conflictos de Tailwind CSS
  return twMerge(clsx(inputs));
}

export const formatDate = ( // Formato de fecha a 'DD/MM/YYYY HH:mm:ss' en zona horaria local
  isoDate: string | Date | null | undefined,
  includeTime: boolean = true
): string => {
  if (!isoDate) return "N/A";

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Fecha inválida"; // Validar fecha
    const options: Intl.DateTimeFormatOptions = { // Opciones de formato
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(includeTime && { // Incluir tiempo si es necesario
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    };
    return new Intl.DateTimeFormat("es-CO", options).format(date);

  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Error de formato";
  }
};

const toCamel = (s: string) => // Convierte keys snake_case a camelCase de forma recursiva, incluyendo objetos anidados y arrays
  s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const deepCamelize = (obj: unknown): unknown => {
  if (Array.isArray(obj)) return obj.map(deepCamelize);
  if (obj && typeof obj === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const nk = toCamel(k);
      (res as Record<string, unknown>)[nk] = deepCamelize(v);
    }
    return res;
  }
  return obj;
};
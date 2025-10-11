import type { OrganigramaNiveles } from "../types/niveles.types";

const KEY = "niveles-organizativos";

export function loadAll(): Record<string, OrganigramaNiveles> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};  // Devuelve un objeto vacío si no hay datos.
  } catch (error) {
    console.error("Error al cargar los niveles organizativos:", error);
    return {};  // Si hay un error, devuelve un objeto vacío.
  }
}

export function saveAll(data: Record<string, OrganigramaNiveles>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));  // Guarda los datos en localStorage.
  } catch (error) {
    console.error("Error al guardar los niveles organizativos:", error);
  }
}

// Elimina la entrada completa de niveles organizativos del localStorage.
export function clearAll() {
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error("Error al limpiar los niveles organizativos:", error);
  }
}

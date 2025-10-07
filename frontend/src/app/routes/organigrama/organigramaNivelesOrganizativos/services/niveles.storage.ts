import type { OrganigramaNiveles } from "../types/niveles.types";

const KEY = "niveles-organizativos";

export function loadAll(): Record<string, OrganigramaNiveles> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAll(data: Record<string, OrganigramaNiveles>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

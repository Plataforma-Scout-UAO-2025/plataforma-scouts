const KEY = "niveles-organizativos";

export function loadAll(): Record<string, any> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAll(data: Record<string, any>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

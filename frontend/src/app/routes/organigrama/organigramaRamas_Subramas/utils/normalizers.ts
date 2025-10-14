export function getIdFrom(obj: Record<string, unknown> | undefined, keys: string[]): string {
  if (!obj) return '';
  return (
    keys
      .map((k) => {
        const v = obj[k];
        if (typeof v === 'string') return v.trim();
        if (v !== undefined && v !== null) return String(v);
        return '';
      })
      .find((s) => s.length > 0) ?? ''
  );
}

export function getDisplayName(obj: Record<string, unknown> | undefined): string {
  if (!obj) return '';
  return (obj['name'] as string) ?? (obj['nombre'] as string) ?? '';
}

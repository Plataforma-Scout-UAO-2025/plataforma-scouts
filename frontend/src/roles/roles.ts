// Utilidades y definiciones relacionadas con Roles de usuario

export const RawRole = {
  ADMIN_GLOBAL: 'ADMIN_GLOBAL',
  ADMIN_GRUPO: 'ADMIN_GRUPO',
  COMITE_ADMIN: 'COMITE_ADMIN',
  DEV_SUPPORT: 'DEV_SUPPORT',
  SCOUT: 'SCOUT',
  SCOUTER: 'SCOUTER',
  TESORERO: 'TESORERO',
  ACUDIENTE: 'ACUDIENTE',
  GUEST: 'GUEST',
  UNKNOWN: 'UNKNOWN'
} as const;

export type RawRole = typeof RawRole[keyof typeof RawRole];

const ALL_ROLE_VALUES: RawRole[] = Object.values(RawRole);

// Mapeo a etiquetas legibles para UI.
const roleLabels: Record<RawRole, string> = {
  [RawRole.ADMIN_GLOBAL]: 'Admin Global',
  [RawRole.ADMIN_GRUPO]: 'Admin Grupo',
  [RawRole.COMITE_ADMIN]: 'Comité Admin',
  [RawRole.DEV_SUPPORT]: 'Dev Support',
  [RawRole.SCOUT]: 'Scout',
  [RawRole.SCOUTER]: 'Scouter',
  [RawRole.TESORERO]: 'Tesorero',
  [RawRole.ACUDIENTE]: 'Acudiente',
  [RawRole.GUEST]: 'Invitado',
  [RawRole.UNKNOWN]: 'Desconocido'
};

// Normaliza una cadena proveniente del backend a un RawRole conocido.
export function normalizeRawRole(raw?: string | null): RawRole {
  if (!raw || typeof raw !== 'string') return RawRole.GUEST;
  const upper = raw.trim().toUpperCase();
  return (ALL_ROLE_VALUES.includes(upper as RawRole) ? (upper as RawRole) : RawRole.UNKNOWN);
}

export function getRoleLabel(role: RawRole | string | null | undefined): string {
  if (!role) return roleLabels[RawRole.GUEST];
  const normalized = normalizeRawRole(String(role));
  return roleLabels[normalized];
}

export interface NormalizedRoleInfo {
  role: RawRole;
  label: string;
}

export function buildRoleInfo(raw?: string | null): NormalizedRoleInfo {
  const role = normalizeRawRole(raw);
  return { role, label: getRoleLabel(role) };
}

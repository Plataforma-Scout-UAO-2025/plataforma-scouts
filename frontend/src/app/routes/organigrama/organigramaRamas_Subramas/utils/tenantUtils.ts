export const extractCandidateValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.id === 'string') {
      const maybeId = record.id.trim();
      if (maybeId) return maybeId;
    }
  }
  return undefined;
};

export const extractTenantIdFromClaims = (claims?: Record<string, unknown>): string | undefined => {
  if (!claims) return undefined;
  const explicitKeys = ['org_id', 'orgId', 'tenant_id', 'tenantId'];
  for (const key of explicitKeys) {
    const match = extractCandidateValue(claims[key]);
    if (match) return match;
  }

  for (const [key, value] of Object.entries(claims)) {
    if (!value) continue;
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes('tenant') || normalizedKey.includes('org')) {
      const match = extractCandidateValue(value);
      if (match) return match;
    }

    if (typeof value === 'object') {
      const nested = extractTenantIdFromClaims(value as Record<string, unknown>);
      if (nested) return nested;
    }
  }

  return undefined;
};

import { logger } from './logger';

export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    if (typeof atob !== 'function') return null;
    const segments = token.split('.');
    if (segments.length < 2) return null;
    const payload = segments[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    logger.warn('No se pudo decodificar el token JWT', error);
    return null;
  }
};

import { decodeJwtPayload, extractTenantIdFromClaims } from './tenantUtils';
import { logger } from './logger';

export const resolveTenantFromToken = async (getAccessTokenSilently: () => Promise<string>): Promise<string | undefined> => {
  try {
    const token = await getAccessTokenSilently();
    const payload = decodeJwtPayload(token);
    const extracted = extractTenantIdFromClaims(payload ?? undefined);
    return extracted;
  } catch (err) {
    logger.error('Error resolving token', err);
    return undefined;
  }
};
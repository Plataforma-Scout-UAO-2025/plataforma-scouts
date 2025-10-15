export interface BackendGroupSummary {
  slug?: string;
  groupSlug?: string;
  [key: string]: unknown;
}

export interface TenantParams {
  tenantId?: string;
  groupSlug?: string;
  isLoading: boolean;
  isFetching: boolean;
  hasMissingParams: boolean;
  error?: string;
}

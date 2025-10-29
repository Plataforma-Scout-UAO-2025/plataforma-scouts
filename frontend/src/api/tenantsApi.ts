import api from "@/api/axios";

export interface Tenant {
  tenant_id?: string;
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const getTenants = async (): Promise<Tenant[]> => {
  const res = await api.get<Tenant[]>("/tenants");
  return res.data || [];
};

export default {
  getTenants,
};

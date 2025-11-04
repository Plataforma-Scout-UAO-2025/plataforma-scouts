import type { Guardian, Status, DocumentType, Role } from '@/types/guardian.type';

/*
Se crea un mapper para evitar error con el casing tanto en back como front
*/

export interface GuardianApiResponse {
  member_id?: number;
  user_id: string;
  rol: Role
  tenant_id: string;
  // API might return either snake_case or camelCase
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  age: number;
  identification: string;
  document_type: DocumentType;
  phone: string;
  is_active: boolean;
  status: Status;
  acceptance_date: string;
  address: string;
}

export function normalizeGuardianData(apiResponse: GuardianApiResponse): Guardian {
  return {
    member_id: apiResponse.member_id,
    user_id: apiResponse.user_id,
    rol: apiResponse.rol,
    tenant_id: apiResponse.tenant_id,
    firstName: apiResponse.firstName || apiResponse.first_name || '',
    lastName: apiResponse.lastName || apiResponse.last_name || '',
    age: apiResponse.age,
    identification: apiResponse.identification,
    document_type: apiResponse.document_type,
    phone: apiResponse.phone,
    is_active: apiResponse.is_active,
    status: apiResponse.status as Status,
    acceptance_date: apiResponse.acceptance_date,
    address: apiResponse.address,
  };
}
export interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  identification: string;
  email: string;
  document_type: string;
  birth_date: string;
  address: string;
  phone: string;
  gender: string;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  status: string;
  acceptance_date: string;
  statusAccount: string;
  city: string;
  branch: string;
  orders: {
    orderNumber: string;
    concept: string;
    value: string;
    date: string;
    status: string;
  }[];
}

export interface MemberFilters {
  search?: string;
  city?: string;
  branch?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  membersByBranch: Record<string, number>;
  membersByCity: Record<string, number>;
}

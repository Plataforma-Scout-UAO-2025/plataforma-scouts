import api from "./axios";

export interface CreateScoutRequest {
  email: string;
  password: string;
  username: string;
}

export interface CreateScoutResponse {
  message: string;
  userId: string;
  email: string;
  username: string;
  role: string;
}

export const createScout = async (
  data: CreateScoutRequest,
): Promise<CreateScoutResponse> => {
  const resp = await api.post<CreateScoutResponse>("/auth0/scouts", data);
  return resp.data;
};

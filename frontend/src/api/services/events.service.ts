import { apiClient } from "../client";
import type { ApiResponse, PaginatedResponse } from "../api.type";
import type {
  Event,
  EventFilters,
  EventStats,
} from "../../app/routes/adminGrupal/Eventos/types/event.type";

const EVENTS_ENDPOINT = "/api/admin-grupal/events";

export const eventsService = {
  getAll: (filters?: EventFilters): Promise<PaginatedResponse<Event>> =>
    apiClient.get(EVENTS_ENDPOINT, { params: filters }).then((res) => res.data),

  getById: (id: number): Promise<ApiResponse<Event>> =>
    apiClient.get(`${EVENTS_ENDPOINT}/${id}`).then((res) => res.data),

  create: (data: Omit<Event, "id">): Promise<ApiResponse<Event>> =>
    apiClient.post(EVENTS_ENDPOINT, data).then((res) => res.data),

  update: (id: number, data: Partial<Event>): Promise<ApiResponse<Event>> =>
    apiClient.put(`${EVENTS_ENDPOINT}/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<ApiResponse<null>> =>
    apiClient.delete(`${EVENTS_ENDPOINT}/${id}`).then((res) => res.data),

  register: (id: number): Promise<ApiResponse<null>> =>
    apiClient.post(`${EVENTS_ENDPOINT}/${id}/register`).then((res) => res.data),

  getStats: (): Promise<ApiResponse<EventStats>> =>
    apiClient.get(`${EVENTS_ENDPOINT}/stats`).then((res) => res.data),
};

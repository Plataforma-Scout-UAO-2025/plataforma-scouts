import { apiClient } from "../client";
import type { ApiResponse } from "../api.type";
import type {
  MemberWithBadges,
  BadgeStats,
} from "../../app/routes/adminGrupal/Insignias/types/badge.type";

const BADGES_ENDPOINT = "/api/admin-grupal/badges";

export const badgesService = {
  getMemberBadges: (): Promise<ApiResponse<MemberWithBadges[]>> =>
    apiClient.get(`${BADGES_ENDPOINT}/members`).then((res) => res.data),

  getMemberById: (id: string): Promise<ApiResponse<MemberWithBadges>> =>
    apiClient.get(`${BADGES_ENDPOINT}/members/${id}`).then((res) => res.data),

  updateMemberBadge: (
    memberId: string,
    badgeId: string,
    completed: boolean
  ): Promise<ApiResponse<null>> =>
    apiClient
      .put(`${BADGES_ENDPOINT}/members/${memberId}/badges/${badgeId}`, {
        completed,
      })
      .then((res) => res.data),

  getStats: (): Promise<ApiResponse<BadgeStats>> =>
    apiClient.get(`${BADGES_ENDPOINT}/stats`).then((res) => res.data),

  getBadgeProgress: (
    memberId: string
  ): Promise<ApiResponse<{ progress: number; total: number }>> =>
    apiClient
      .get(`${BADGES_ENDPOINT}/progress/${memberId}`)
      .then((res) => res.data),
};

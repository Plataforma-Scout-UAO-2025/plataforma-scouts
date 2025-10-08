import type { Member as BaseMember } from "../../Miembros/types/member.type";

export interface Badge {
  id: number;
  name: string;
  description: string;
  progress: number;
}

export interface MemberWithBadges extends Pick<BaseMember, 'branch'> {
  memberId: number;
  memberName: string;
  age: number;
  completedBadges: number;
  totalBadges: number;
  badges: Badge[];
  id?: string;
  status?: string;
  city?: string;
}

export interface BadgeStats {
  totalBadges: number;
  totalMembers: number;
  averageCompletion: number;
  badgesByCategory: Record<string, number>;
  topPerformers: Array<{
    memberId: string;
    memberName: string;
    completedBadges: number;
  }>;
}
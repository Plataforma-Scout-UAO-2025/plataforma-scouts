import BadgeCard from "./BadgeCard";
import type { MemberWithBadges } from "../types/badge.type";

interface MemberBadgesProps {
  member: MemberWithBadges;
}

const MemberBadges = ({ member }: MemberBadgesProps) => {
  return (
    <div className="rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-primary">
            {member.memberName} ({member.branch})
          </h3>
          <p className="text-sm text-gray-600">
            {member.branch}-{member.age} años
          </p>
        </div>
        <p className="text-sm text-gray-500">
          {member.completedBadges} de {member.totalBadges} insignias
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        {member.badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
};

export default MemberBadges;
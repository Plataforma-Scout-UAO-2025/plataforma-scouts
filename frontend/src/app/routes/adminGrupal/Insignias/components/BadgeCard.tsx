import { Progress } from "@/components/ui/index";
import type { Badge } from "../types/badge.type";

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard = ({ badge }: BadgeCardProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-md flex-1 min-w-0 md:flex-none md:w-[calc(33.333%-0.67rem)]">
      <h4 className="font-bold text-primary mb-2">{badge.name}</h4>
      <p className="text-sm text-gray-600 mb-3">
        {badge.description}
      </p>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Progreso</span>
          <span className="text-sm font-medium">
            {badge.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <Progress value={badge.progress} className="mt-4" />
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
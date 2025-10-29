import type { MemberBasicInfo } from "@/types/guardian.type";

interface InterestsSectionProps {
  member: MemberBasicInfo;
}

export default function InterestsSection({ member }: InterestsSectionProps) {
  // Solo renderizar si hay intereses disponibles
  if (!member.hobbies && !member.sports && !member.instruments) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Intereses y Actividades
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {member.hobbies && (
          <div>
            <label className="text-sm font-medium text-gray-500">Pasatiempos</label>
            <p className="text-gray-900">{member.hobbies}</p>
          </div>
        )}
        {member.sports && (
          <div>
            <label className="text-sm font-medium text-gray-500">Deportes</label>
            <p className="text-gray-900">{member.sports}</p>
          </div>
        )}
        {member.instruments && (
          <div>
            <label className="text-sm font-medium text-gray-500">Instrumentos</label>
            <p className="text-gray-900">{member.instruments}</p>
          </div>
        )}
      </div>
    </div>
  );
}
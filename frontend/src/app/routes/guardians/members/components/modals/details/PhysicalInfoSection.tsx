import type { MemberBasicInfo } from "@/types/guardian.type";

interface PhysicalInfoSectionProps {
  member: MemberBasicInfo;
}

export default function PhysicalInfoSection({ member }: PhysicalInfoSectionProps) {
  // Solo renderizar si hay información física disponible
  if (!member.weight && !member.height) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Información Física
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {member.weight && (
          <div>
            <label className="text-sm font-medium text-gray-500">Peso</label>
            <p className="text-gray-900">{member.weight} kg</p>
          </div>
        )}
        {member.height && (
          <div>
            <label className="text-sm font-medium text-gray-500">Altura</label>
            <p className="text-gray-900">{member.height} cm</p>
          </div>
        )}
      </div>
    </div>
  );
}
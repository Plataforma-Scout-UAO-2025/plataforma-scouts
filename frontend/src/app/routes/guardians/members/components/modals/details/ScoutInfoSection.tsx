import { Badge } from "@/components/ui/badge";
import type { MemberBasicInfo } from "@/types/guardian.type";

interface ScoutInfoSectionProps {
  member: MemberBasicInfo;
}

export default function ScoutInfoSection({ member }: ScoutInfoSectionProps) {
  const formatRole = (role?: string): string => {
    if (!role) return "Sin rol";
    return role
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusBadge = () => {
    const isActive = member.is_active;
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          Activo
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          Inactivo
        </Badge>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Información Scout
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Rama</label>
          <p className="text-gray-900">
            {member.subgroup?.name || "Sin asignar"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Rol</label>
          <p className="text-gray-900">{formatRole(member.role)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Estado</label>
          <div>{getStatusBadge()}</div>
        </div>
      </div>
    </div>
  );
}
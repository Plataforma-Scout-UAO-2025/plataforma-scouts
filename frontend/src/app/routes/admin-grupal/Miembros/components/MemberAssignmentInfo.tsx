import type { Member } from "@/types/member.type";

interface Props {
  member: Member;
}

export default function MemberAssignmentInfo({ member }: Props) {

  const rama =
    member.subgroup?.section?.name ||
    member.section_name ||
    "No asignada";

  const subrama =
    member.subgroup?.name || member.subgroup_name || "No asignada";

  const rol = member.role
    ? member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()
    : "No asignado";

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        Información de Asignación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Rama</p>
          <p className="text-sm font-semibold text-gray-900">{rama}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Subrama</p>
          <p className="text-sm font-semibold text-gray-900">{subrama}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Rol</p>
          <p className="text-sm font-semibold text-gray-900">{rol}</p>
        </div>
      </div>
    </div>
  );
}

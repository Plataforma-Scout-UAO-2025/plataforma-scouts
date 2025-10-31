import { Label } from "@/components/ui/label";
import type { Member } from "@/types/member.type";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aceptado",
  REJECTED: "Rechazado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function MemberStatusBar({ member }: { member: Member }) {
  const status = member.status ?? "PENDING";
  const colorClass = statusColors[status] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-gray-600">
            Estado de la solicitud
          </Label>
          <div className="mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {member.created_at && (
          <div className="text-right">
            <Label className="text-sm font-medium text-gray-600">
              Fecha de solicitud
            </Label>
            <div className="mt-1 text-sm text-gray-700">
              {new Date(member.created_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

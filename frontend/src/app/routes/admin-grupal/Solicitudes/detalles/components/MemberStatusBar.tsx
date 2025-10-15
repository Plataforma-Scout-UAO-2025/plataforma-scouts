import { Label } from "@/components/ui/label";
import type { Member } from "@/types/member.type";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aceptado",
  REJECTED: "Rechazado",
};

export default function MemberStatusBar({ member }: { member: Member }) {
  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-gray-600">
            Estado de la solicitud
          </Label>
          <div className="mt-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                member.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {statusLabels[member.status ?? "PENDING"]}
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

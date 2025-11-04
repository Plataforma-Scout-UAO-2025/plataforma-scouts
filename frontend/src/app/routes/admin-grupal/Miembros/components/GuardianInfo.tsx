import { Label } from "@/components/ui/label";
import type { Guardian } from "@/types/guardian.type";

interface GuardianInfoProps {
  guardian: Guardian | null;
  loading: boolean;
}

export default function GuardianInfo({ guardian, loading }: GuardianInfoProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
          Información del acudiente
        </h2>
        <div className="p-4 bg-gray-50 text-center rounded-md border border-gray-200">
          <p className="text-gray-600">Cargando información del acudiente...</p>
        </div>
      </div>
    );
  }

  if (!guardian) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
          Información del acudiente
        </h2>
        <div className="p-4 bg-gray-50 text-center rounded-md border border-gray-200">
          <p className="text-gray-600">Este scout no tiene acudiente asignado.</p>
        </div>
      </div>
    );
  }

  const infoItems = [
    ["Nombres", `${guardian.firstName ?? ""} ${guardian.lastName ?? ""}`.trim() || "Sin información"],
    ["Tipo de documento", guardian.document_type || "Sin información"],
    ["Número de documento", guardian.identification || "Sin información"],
    ["Teléfono", guardian.phone || "Sin información"],

  ] as const;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
        Información del acudiente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map(([label, value], idx) => (
          <div key={idx}>
            <Label>{label}</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

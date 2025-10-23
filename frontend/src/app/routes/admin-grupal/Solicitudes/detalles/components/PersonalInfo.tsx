import { Label } from "@/components/ui/label";
import type { UpdateMember } from "@/types/member.type";

export default function PersonalInfo({ member }: { member: UpdateMember}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
        Información personal
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            ["Nombres *", member.firstName || "Sin información"],
            ["Apellidos *", member.lastName || "Sin información"],
            ["Correo electrónico *", member.email || "Sin información"],
            ["Tipo de documento *", member.documentType || "Sin información"],
            [
              "Número de documento *",
              member.identification || "Sin información",
            ],
            [
              "Fecha de nacimiento *",
              member.birthDate
                ? new Date(member.birthDate).toLocaleDateString("es-CO")
                : "Sin información",
            ],
            ["Género *", member.gender || "Sin información"],
            ["Teléfono *", member.phone || "Sin información"],
            ["Dirección *", member.address || "Sin información"],
            ["Peso (kg)", member.weight || "No especificado"],
            ["Altura (cm)", member.height || "No especificado"],
          ] as const
        ).map(([label, value], idx) => (
          <div
            className={idx === 8 ? "w-full md:col-span-2" : "w-full"}
            key={idx}
          >
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

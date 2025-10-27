import { Label } from "@/components/ui/label";
import type { Member } from "@/types/member.type";

export default function EmergencyContacts({ member }: { member: Member }) {
  if (!member.emergency_contacts?.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">Contactos de emergencia</h2>
      {member.emergency_contacts.map((c, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-gray-50"
        >
          <div className="w-full">
            <Label>Nombre</Label>
            <div className="mt-1 p-2 bg-white rounded-md border border-gray-200">
              {c.name}
            </div>
          </div>
          <div className="w-full">
            <Label>Parentesco</Label>
            <div className="mt-1 p-2 bg-white rounded-md border border-gray-200">
              {c.relationship}
            </div>
          </div>
          <div className="w-full">
            <Label>Teléfono</Label>
            <div className="mt-1 p-2 bg-white rounded-md border border-gray-200">
              {c.phone}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

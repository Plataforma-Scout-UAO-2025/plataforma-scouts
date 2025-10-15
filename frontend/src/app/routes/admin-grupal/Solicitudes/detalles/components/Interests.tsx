import { Label } from "@/components/ui/label";
import type { Member } from "@/types/member.type";

export default function Interests({ member }: { member: Member }) {
  if (!(member.hobbies || member.sports || member.instruments)) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
        Intereses y habilidades
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {member.hobbies && (
          <div className="w-full">
            <Label>Pasatiempos</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
              {member.hobbies}
            </div>
          </div>
        )}
        {member.sports && (
          <div className="w-full">
            <Label>Deportes</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
              {member.sports}
            </div>
          </div>
        )}
        {member.instruments && (
          <div className="w-full">
            <Label>Instrumentos musicales</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
              {member.instruments}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

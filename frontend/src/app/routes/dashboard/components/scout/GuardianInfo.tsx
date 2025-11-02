import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, UserCircle } from "lucide-react";
import type { Guardian, GuardianWithMembers } from "@/types/guardian.type";

interface GuardianInfoProps {
  guardian: Guardian | null;
  guardianWithMembers?: GuardianWithMembers | null;
  loading: boolean;
}

export default function GuardianInfo({
  guardian,
  guardianWithMembers,
  loading,
}: GuardianInfoProps) {
  if (loading) {
    return (
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
            <UserCircle className="text-primary" />
            Información del Acudiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">Cargando información...</p>
        </CardContent>
      </Card>
    );
  }

  if (!guardian) {
    return (
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
            <UserCircle className="text-primary" />
            Información del Acudiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            No tienes un acudiente asignado actualmente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
          <UserCircle className="text-primary" />
          Información del Acudiente
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-lg">
        <p>
          <strong>Nombre:</strong> {guardian.first_name} {guardian.last_name}
        </p>

        <p>
          <strong>Documento:</strong> {guardian.document_type} {guardian.identification}
        </p>

        <p>
          <strong>Teléfono:</strong>{" "}
          {guardian.phone ? (
            <>
              <Phone className="inline-block w-4 h-4 mr-1 text-primary" />
              {guardian.phone}
            </>
          ) : (
            "No registrado"
          )}
        </p>

        {guardianWithMembers?.relationship && (
          <p>
            <strong>Relación:</strong> {guardianWithMembers.relationship}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

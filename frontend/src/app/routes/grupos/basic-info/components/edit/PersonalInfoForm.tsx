import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UpdateMember } from "@/types/member.type";

interface PersonalInfoFormProps {
  editedData: {
    phone?: string;
    address?: string;
    firstName?: string;
    lastName?: string;
    identification?: string;

  };
  loading: boolean;
  onFieldChange: (field: keyof UpdateMember, value: string) => void;
}

export default function PersonalInfoForm({
  editedData,
  loading,
  onFieldChange,
}: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
        Información Personal
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            value={editedData.phone || ""}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="Ingrese el número de contacto"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            value={editedData.address || ""}
            onChange={(e) => onFieldChange("address", e.target.value)}
            placeholder="Ingrese la dirección"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            value={editedData.firstName || ""}
            disabled
            className="bg-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            value={editedData.lastName || ""}
            disabled
            className="bg-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="identification">Identificación</Label>
          <Input
            id="identification"
            value={editedData.identification || ""}
            disabled
            className="bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
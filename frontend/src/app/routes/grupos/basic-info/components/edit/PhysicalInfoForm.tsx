import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UpdateMember } from "@/types/member.type";

interface PhysicalInfoFormProps {
  editedData: {
    weight?: string;
    height?: string;
  };
  loading: boolean;
  onFieldChange: (field: keyof UpdateMember, value: string) => void;
}

export default function PhysicalInfoForm({
  editedData,
  loading,
  onFieldChange,
}: PhysicalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
        Información Física
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg) *</Label>
          <Input
            id="weight"
            type="number"
            value={editedData.weight || ""}
            onChange={(e) => onFieldChange("weight", e.target.value)}
            placeholder="Ej: 60"
            disabled={loading}
            min="0"
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm) *</Label>
          <Input
            id="height"
            type="number"
            value={editedData.height || ""}
            onChange={(e) => onFieldChange("height", e.target.value)}
            placeholder="Ej: 170"
            disabled={loading}
            min="0"
            step="1"
          />
        </div>
      </div>
    </div>
  );
}
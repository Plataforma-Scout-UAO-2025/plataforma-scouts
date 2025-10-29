import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Section } from "@/types/section-simple.type";
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { Group } from "@/hooks/useOrgStructure";

interface AssignmentSectionProps {
  groups: Group[];
  sections: Section[];
  subgroups: Subgroup[];
  selectedGroupSlug: string;
  setSelectedGroupSlug: (v: string) => void;
  selectedSection: string;
  setSelectedSection: (v: string) => void;
  selectedSubgroup: string;
  setSelectedSubgroup: (v: string) => void;
  loading?: boolean;
  currentAssignment?: {
    sectionName?: string;
    subgroupName?: string;
  };
}

export default function AssignmentSection({
  groups,
  sections,
  subgroups,
  selectedGroupSlug,
  setSelectedGroupSlug,
  selectedSection,
  setSelectedSection,
  selectedSubgroup,
  setSelectedSubgroup,
  loading = false,
  currentAssignment,
}: AssignmentSectionProps) {
  return (
    <div className="space-y-4 border-t-2 pt-4">
      <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
        Asignación de Rama y Subrama
      </h3>

      {groups.length > 1 && (
        <div className="w-full">
          <Label htmlFor="group">Grupo</Label>
          <Select
            value={selectedGroupSlug}
            onValueChange={(value) => {
              setSelectedGroupSlug(value);
              setSelectedSection("");
              setSelectedSubgroup("");
            }}
            disabled={loading}
          >
            <SelectTrigger id="group" className="w-full">
              <SelectValue placeholder="Selecciona un grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.groupId} value={g.groupSlug}>
                  {g.groupName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-full">
        <Label htmlFor="section">Rama</Label>
        <Select
          value={selectedSection}
          onValueChange={(value) => {
            setSelectedSection(value);
            setSelectedSubgroup("");
          }}
          disabled={!selectedGroupSlug || loading}
        >
          <SelectTrigger id="section" className="w-full">
            <SelectValue placeholder="Selecciona una rama" />
          </SelectTrigger>
          <SelectContent>
            {sections.length > 0 ? (
              sections.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-sections" disabled>
                {selectedGroupSlug
                  ? "No hay ramas disponibles"
                  : "Selecciona un grupo primero"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full">
        <Label htmlFor="subgroup">Subrama</Label>
        <Select
          value={selectedSubgroup}
          onValueChange={setSelectedSubgroup}
          disabled={!selectedSection || subgroups.length === 0 || loading}
        >
          <SelectTrigger id="subgroup" className="w-full">
            <SelectValue placeholder="Selecciona una subrama" />
          </SelectTrigger>
          <SelectContent>
            {subgroups.length > 0 ? (
              subgroups.map((sg) => (
                <SelectItem key={sg.id} value={sg.id.toString()}>
                  {sg.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-subgroups" disabled>
                {selectedSection
                  ? "No hay subramas disponibles"
                  : "Selecciona una rama primero"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {selectedSection && subgroups.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No hay subramas disponibles para esta rama
          </p>
        )}
      </div>

      {/* Mostrar asignación actual */}
      {currentAssignment && (currentAssignment.sectionName || currentAssignment.subgroupName) && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Asignación actual:</strong> {currentAssignment.sectionName || "Sin rama"} - {currentAssignment.subgroupName || "Sin subrama"}
          </p>
        </div>
      )}
    </div>
  );
}
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
import type { RoleSummary } from "@/api/membersApi";

interface Props {
  groups: Group[];
  sections: Section[];
  subgroups: Subgroup[];
  selectedGroupSlug: string;
  setSelectedGroupSlug: (v: string) => void;
  selectedSection: string;
  setSelectedSection: (v: string) => void;
  selectedSubgroup: string;
  setSelectedSubgroup: (v: string) => void;
  roles: RoleSummary[];
  rolesLoading: boolean;
  rolesError: string | null;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
}

export default function AssignmentSelectors(props: Props) {
  const {
    groups,
    sections,
    subgroups,
    selectedGroupSlug,
    setSelectedGroupSlug,
    selectedSection,
    setSelectedSection,
    selectedSubgroup,
    setSelectedSubgroup,
    roles,
    rolesLoading,
    rolesError,
    selectedRole,
    setSelectedRole,
  } = props;

  return (
    <div className="space-y-4 pt-4 border-t-2">
      <h2 className="text-xl font-semibold text-primary">
        Asignar Grupo, Rama y Subrama
      </h2>

      {groups.length > 1 && (
        <div className="w-full">
          <Label htmlFor="group">Grupo *</Label>
          <Select
            value={selectedGroupSlug}
            onValueChange={(value) => {
              setSelectedGroupSlug(value);
              setSelectedSection("");
              setSelectedSubgroup("");
            }}
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
        <Label htmlFor="section">Rama *</Label>
        <Select
          value={selectedSection}
          onValueChange={(value) => {
            setSelectedSection(value);
            setSelectedSubgroup("");
          }}
          disabled={!selectedGroupSlug}
          required
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
          disabled={!selectedSection || subgroups.length === 0}
          required
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

      <div className="pt-4">
        <h3 className="text-lg font-medium">Rol</h3>
        {rolesError ? (
          <p className="text-destructive">{rolesError}</p>
        ) : (
          <div className="w-full">
            <Label htmlFor="role">Selecciona un rol *</Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val)}
              disabled={rolesLoading || roles.length === 0}
              required
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue
                  placeholder={
                    rolesLoading
                      ? "Cargando roles..."
                      : roles.length === 0
                      ? "No hay roles disponibles"
                      : "Selecciona un rol"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <SelectItem key={r.id} value={r.name.toUpperCase()}>
                      {r.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-roles" disabled>
                    {rolesLoading ? "Cargando..." : "Sin roles disponibles"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {selectedRole && (
              <p className="text-xs text-gray-500 mt-1">
                {
                  roles.find((x) => x.name.toUpperCase() === selectedRole)
                    ?.description
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

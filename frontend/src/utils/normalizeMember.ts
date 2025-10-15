import type { Member } from "@/types/member.type";

export type NormalizedMember = {
  member_id?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string | null;
  address?: string | null;
  status?: string;
  tenant_id?: string | undefined;
  branches?: string[];
  raw?: Member;
};

const mappingStatus = (isActive: boolean | undefined | null): string => {
  if (isActive === undefined || isActive === null) return "Inactivo";
  return isActive ? "Activo" : "Inactivo";
};

export function normalizeMember(member: Member): NormalizedMember {
  const rec = member as unknown as Record<string, unknown>;
  const memberId = (rec["member_id"] ?? rec["memberId"]) as number | undefined;
  const firstName = (rec["first_name"] ?? rec["firstName"] ?? "") as string;
  const lastName = (rec["last_name"] ?? rec["lastName"] ?? "") as string;
  const createdAt = (rec["created_at"] ?? rec["createdAt"] ?? null) as string | null;
  const address = (rec["address"] ?? rec["address"] ?? null) as string | null;
  const isActive = (rec["is_active"] ?? rec["isActive"]) as boolean | undefined | null;
  const tenantId = (rec["tenant_id"] ?? rec["tenantId"]) as string | undefined;

  // Extract branches from possible shapes
  let branches: string[] = [];

  // New backend shape: subgroup could be an object with section.name
  // subgroup may be array or single object; narrow at runtime
  const subgroup = rec["subgroup"] as unknown;
  if (subgroup) {
    if (Array.isArray(subgroup)) {
      for (const sg of subgroup) {
        if (sg && typeof sg === "object" && (sg as any).section) {
          const sec = (sg as any).section;
          if (Array.isArray(sec)) {
            for (const s of sec) if (s && typeof s === "object" && (s as any).name) branches.push(String((s as any).name));
          } else if (sec && typeof sec === "object" && (sec as any).name) {
            branches.push(String((sec as any).name));
          }
        }
      }
    } else if (typeof subgroup === "object") {
      const sg = subgroup as unknown as Record<string, unknown>;
      if (sg["section"]) {
        const sec = sg["section"];
        if (Array.isArray(sec)) {
          for (const s of sec) if (s && typeof s === "object" && (s as any).name) branches.push(String((s as any).name));
        } else if (sec && typeof sec === "object" && (sec as any).name) {
          branches.push(String((sec as any).name));
        }
      }
    }
  }

  // Legacy: branch[] array of Section objects
  const branchArr = rec["branch"] as unknown;
  if (Array.isArray(branchArr)) {
    for (const b of branchArr) if (b && typeof b === "object" && (b as any).name) branches.push(String((b as any).name));
  }

  // Deduplicate
  branches = Array.from(new Set(branches));

  return {
    member_id: memberId,
    first_name: firstName,
    last_name: lastName,
    created_at: createdAt,
    address,
    status: mappingStatus(isActive as boolean | undefined),
    tenant_id: tenantId,
    branches,
    raw: member,
  };
}

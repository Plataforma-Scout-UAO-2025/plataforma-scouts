import { useEffect, useState } from "react";
import { getMembersBySubgroup } from "@/api/organigramaApi";
import {
  isMemberActiveAndApproved,
  isMemberScouter,
} from "@/hooks/useSubgroupMembers";
import type { Member } from "@/types/member.type";
import type { Subgroup } from "@/app/routes/organigrama/organigramaRamas_Subramas/types/frontend";

interface SubramaWithMembers {
  subgroupId: number;
  name: string;
  jefes: Member[];
  scouts: Member[];
  loading: boolean;
  error: string | null;
}

interface UseRamaMembersReturn {
  subramasWithMembers: SubramaWithMembers[];
  loading: boolean;
  error: string | null;
}

export const useRamaMembers = (subramas?: Subgroup[]): UseRamaMembersReturn => {
  const [subramasWithMembers, setSubramasWithMembers] = useState<
    SubramaWithMembers[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subramas || subramas.length === 0) {
      setSubramasWithMembers([]);
      return;
    }

    const fetchMembersForAllSubramas = async () => {
      setLoading(true);
      setError(null);

      try {
        // Preparar estructura inicial
        const initialSubramas: SubramaWithMembers[] = subramas.map(
          (subrama) => ({
            subgroupId: Number(subrama.subgroup_id || subrama.id),
            name: subrama.name || subrama.nombre || "Sin nombre",
            jefes: [],
            scouts: [],
            loading: true,
            error: null,
          })
        );

        setSubramasWithMembers(initialSubramas);

        // Obtener miembros de cada subrama en paralelo
        const memberPromises = initialSubramas.map(async (subrama) => {
          try {
            const members = await getMembersBySubgroup(subrama.subgroupId);

            // Filtrar solo miembros activos y aprobados
            const activeMembers = members.filter((member) =>
              isMemberActiveAndApproved(
                member as Member & Record<string, unknown>
              )
            );

            // Separar jefes (SCOUTERS) de scouts
            const jefes = activeMembers.filter((member) =>
              isMemberScouter(member as Member & Record<string, unknown>)
            );

            const scouts = activeMembers.filter(
              (member) =>
                !isMemberScouter(member as Member & Record<string, unknown>)
            );

            return {
              ...subrama,
              jefes: jefes as Member[],
              scouts: scouts as Member[],
              loading: false,
              error: null,
            };
          } catch (err) {
            console.error(
              `Error obteniendo miembros para subrama ${subrama.name}:`,
              err
            );
            return {
              ...subrama,
              loading: false,
              error: "Error cargando miembros",
            };
          }
        });

        const results = await Promise.all(memberPromises);
        setSubramasWithMembers(results);
      } catch (err) {
        console.error("Error general obteniendo miembros de subramas:", err);
        setError("Error cargando miembros de las subramas");
      } finally {
        setLoading(false);
      }
    };

    fetchMembersForAllSubramas();
  }, [subramas]);

  return {
    subramasWithMembers,
    loading,
    error,
  };
};

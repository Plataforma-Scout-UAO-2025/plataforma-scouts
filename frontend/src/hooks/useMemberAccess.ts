import { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import type { Member } from "@/types/member.type";
import { normalizeRawRole, RawRole } from "@/roles/roles";

interface MemberAccessResult {
  hasAccess: boolean;
  reason: "pending" | "inactive" | null;
  member: Member | null;
  loading: boolean;
}

/**
 * Hook que valida si un usuario puede acceder al dashboard.
 * 
 * Para la mayoría de roles (Scout, Scouter, etc.):
 *   - Necesitan estar en la base de datos
 *   - Su estado debe ser "APPROVED"
 *   - Deben estar activos (isActive = true)
 * 
 * Para Admins (Admin Global y Admin Grupo):
 *   - Pueden acceder aunque no estén en la BD, usando su rol de Auth0
 *   - Si están en la BD, aplican las mismas reglas que otros roles
 * 
 * @returns {MemberAccessResult} Info del acceso y razón si fue denegado
 */
export function useMemberAccess(): MemberAccessResult {
  const dispatch = useAppDispatch();
  const { user } = useAuth0();
  const { members, loading } = useAppSelector((state) => state.members);
  
  // Guardamos si ya trajimos los miembros de la BD para no hacer el fetch varias veces
  const hasFetchedRef = useRef(false);
  
  const [accessState, setAccessState] = useState<MemberAccessResult>({
    hasAccess: false,
    reason: null,
    member: null,
    loading: true,
  });

  // Traemos la lista de miembros de la BD solo una vez cuando se monta el componente
  useEffect(() => {
    if (!hasFetchedRef.current) {
      dispatch(fetchMembersWithBranchAction());
      hasFetchedRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    // Mientras se cargan los datos, mostramos loading
    if (loading) {
      setAccessState({
        hasAccess: false,
        reason: null,
        member: null,
        loading: true,
      });
      return;
    }

    // Necesitamos el email del usuario para buscarlo en la BD
    const currentUserEmail = user?.email;
    if (!currentUserEmail) {
      setAccessState({
        hasAccess: false,
        reason: null,
        member: null,
        loading: false,
      });
      return;
    }

    const currentMember = members.find((m) => m.email === currentUserEmail);

    // ¿El usuario NO está en la base de datos?
    if (!currentMember) {
      // Chequeamos si es admin usando su rol de Auth0
      const auth0Roles = (user as any)?.["https://scouts-platform-backend//roles"] || [];
      const userRole = auth0Roles[0] ? normalizeRawRole(auth0Roles[0]) : RawRole.UNKNOWN;
      
      // Los admins pueden entrar aunque no estén en la BD
      if (userRole === RawRole.ADMIN_GLOBAL || userRole === RawRole.ADMIN_GRUPO) {
        setAccessState({
          hasAccess: true,
          reason: null,
          member: null,
          loading: false,
        });
        return;
      }
      
      // Si no es admin y no está en la BD, no puede entrar
      setAccessState({
        hasAccess: false,
        reason: null,
        member: null,
        loading: false,
      });
      return;
    }

    // Ahora sí, el usuario está en la BD. Validamos su estado
    const memberRole = normalizeRawRole((currentMember as any).role ?? (currentMember as any).rol);
    const memberStatusRaw = (currentMember as any).status ?? (currentMember as any).estado ?? null;
    const memberStatus = typeof memberStatusRaw === "string" ? memberStatusRaw.toUpperCase() : memberStatusRaw;
    
    // Lógica especial para Admin Global y Admin Grupo
    if (memberRole === RawRole.ADMIN_GLOBAL || memberRole === RawRole.ADMIN_GRUPO) {
      // Si no tienen estado o están aprobados, pueden entrar sin problema
      if (memberStatusRaw === null || memberStatusRaw === undefined || memberStatus === "APPROVED") {
        setAccessState({
          hasAccess: true,
          reason: null,
          member: currentMember,
          loading: false,
        });
        return;
      }
      
      // Si están rechazados o pendientes, mostramos un modal
      if (memberStatus !== "APPROVED") {
        setAccessState({
          hasAccess: false,
          reason: "pending",
          member: currentMember,
          loading: false,
        });
        return;
      }
    }

    // Para roles normales (Scout, Scouter, etc.), el estado debe ser "APPROVED"
    if (typeof memberStatus === "string" && memberStatus !== "APPROVED") {
      setAccessState({
        hasAccess: false,
        reason: "pending",
        member: currentMember,
        loading: false,
      });
      return;
    }

    // Además, deben estar activos
    if (!currentMember.isActive) {
      setAccessState({
        hasAccess: false,
        reason: "inactive",
        member: currentMember,
        loading: false,
      });
      return;
    }

    // Todo bien, puede entrar al dashboard
    setAccessState({
      hasAccess: true,
      reason: null,
      member: currentMember,
      loading: false,
    });
  }, [members, loading, user]);

  return accessState;
}

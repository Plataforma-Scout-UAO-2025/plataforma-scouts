import { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import type { Member } from "@/types/member.type";

interface MemberAccessResult {
  hasAccess: boolean;
  reason: "pending" | "inactive" | null;
  member: Member | null;
  loading: boolean;
}

/**
 * Hook personalizado para validar el acceso de cualquier miembro al sistema.
 * 
 * Valida dos condiciones para TODOS los roles:
 * 1. El status del miembro debe ser "APPROVED"
 * 2. El miembro debe estar activo (isActive === true)
 * 
 * @returns {MemberAccessResult} Estado de acceso del miembro
 */
export function useMemberAccess(): MemberAccessResult {
  const dispatch = useAppDispatch();
  const { user } = useAuth0();
  const { members, loading } = useAppSelector((state) => state.members);
  
  // useRef para rastrear si ya se hizo el fetch inicial
  // Esto evita el loop infinito al hacer múltiples dispatches
  const hasFetchedRef = useRef(false);
  
  const [accessState, setAccessState] = useState<MemberAccessResult>({
    hasAccess: false,
    reason: null,
    member: null,
    loading: true,
  });

  // Efecto para cargar miembros SOLO UNA VEZ al montar el componente
  useEffect(() => {
    // Solo dispatch si nunca se ha hecho antes
    if (!hasFetchedRef.current) {
      dispatch(fetchMembersWithBranchAction());
      hasFetchedRef.current = true; // Marcar como "ya se hizo"
    }
  }, [dispatch]); // Solo depende de dispatch (estable)

  useEffect(() => {
    // Esperar a que termine la carga
    if (loading) {
      setAccessState({
        hasAccess: false,
        reason: null,
        member: null,
        loading: true,
      });
      return;
    }

    // Buscar el miembro actual por email
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

    if (!currentMember) {
      setAccessState({
        hasAccess: false,
        reason: null,
        member: null,
        loading: false,
      });
      return;
    }

    // Validar status: debe ser "APPROVED"
    const memberStatus = currentMember.status?.toUpperCase();
    if (memberStatus !== "APPROVED") {
      setAccessState({
        hasAccess: false,
        reason: "pending",
        member: currentMember,
        loading: false,
      });
      return;
    }

    // Validar isActive: debe ser true
    // Verificar directamente la propiedad isActive en lugar de usar la función
    if (!currentMember.isActive) {
      setAccessState({
        hasAccess: false,
        reason: "inactive",
        member: currentMember,
        loading: false,
      });
      return;
    }

    // Si pasó todas las validaciones, tiene acceso
    setAccessState({
      hasAccess: true,
      reason: null,
      member: currentMember,
      loading: false,
    });
  }, [members, loading, user]);

  return accessState;
}

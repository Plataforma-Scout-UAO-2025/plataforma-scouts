import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import PersonalInfo from "@/app/routes/admin-grupal/Solicitudes/detalles/components/PersonalInfo";
import EmergencyContacts from "@/app/routes/admin-grupal/Solicitudes/detalles/components/EmergencyContacts";
import Interests from "@/app/routes/admin-grupal/Solicitudes/detalles/components/Interests";
import SchoolInfo from "@/app/routes/admin-grupal/Solicitudes/detalles/components/SchoolInfo";

import type { Member } from "@/types/member.type";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  fetchMembersWithBranchAction,
  fetchMemberAction,
} from "@/store/members/membersActions";

const ScoutEnrollmentInfo = () => {
  const { user } = useAuth0();
  const dispatch = useAppDispatch();

  const members = useAppSelector((state) => state.members.members || []);
  const loading = useAppSelector((state) => state.members.loading);
  const fullMemberData = useAppSelector((state) => state.members.member);

  const [basicMember, setBasicMember] = useState<Member | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

  useEffect(() => {
    if (loading || !user?.email || members.length === 0) return;

    const foundMember = members.find(
      (m: Member) => m.email?.toLowerCase() === user.email?.toLowerCase()
    );

    setBasicMember(foundMember || null);
  }, [members, user?.email, loading]);

  useEffect(() => {
    const loadFullDetails = async () => {
      const memberId = basicMember?.member_id ?? basicMember?.memberId;
      if (!memberId) {
        setInitialLoad(false);
        return;
      }

      try {
        await dispatch(fetchMemberAction(memberId)).unwrap();
      } catch (error) {
        console.error("Error al cargar datos completos:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadFullDetails();
  }, [basicMember, dispatch]);

  const displayMember = fullMemberData || basicMember;

  if (initialLoad && !displayMember) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando información...</p>
      </div>
    );
  }

  if (!displayMember) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            No se encontró información del scout
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Email buscado: {user?.email}
          </p>
        </div>
      </div>
    );
  }

  const totalPaginas = 3;
  const progreso = (pagina / totalPaginas) * 100;

  const getCamposPagina = () => {
    if (pagina === 1) {
      return (
        <>
          <div className="col-span-full">
            <PersonalInfo member={displayMember} />
          </div>

          <div className="col-span-full">
            {displayMember.emergency_contacts?.length ? (
              <EmergencyContacts member={displayMember} />
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2">
                  Contactos de Emergencia
                </h2>
                <p className="text-sm text-gray-500 italic">
                  No hay contactos de emergencia registrados
                </p>
              </div>
            )}
          </div>
        </>
      );
    }

    if (pagina === 2) {
      return (
        <div className="col-span-full">
          <Interests member={displayMember} />
        </div>
      );
    }

    return (
      <div className="col-span-full">
        <SchoolInfo memberId={displayMember.member_id ?? displayMember.memberId} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center md:text-left">
        Mi Información de Inscripción
      </h1>

      <div className="max-w-2xl mx-auto mb-8">
        <Progress value={progreso} className="h-2 bg-muted" />
        <p className="text-sm text-center mt-2 text-muted-foreground">
          Sección {pagina} de {totalPaginas}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto bg-card shadow-md rounded-2xl p-6">
        {getCamposPagina()}

        <div className="col-span-full flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Atrás
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoutEnrollmentInfo;
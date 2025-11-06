import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAuth0 } from "@auth0/auth0-react";
import { useMemberStatusDialog } from "@/hooks/useMemberStatusDialog";
import { useMemberAccess } from "@/hooks/useMemberAccess";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchMembersWithBranchAction } from "@/store/members/membersActions";
import { User, Flag } from "lucide-react";
import PendingApprovalModal from "@/app/routes/admin-grupal/Miembros/components/PendingApprovalModal";
import InactiveMemberModal from "@/app/routes/admin-grupal/Miembros/components/InactiveMemberModal";

import { guardianService } from "@/app/routes/guardians/services/guardianService";
import type { Guardian } from "@/types/guardian.type";
import GuardianInfo from "@/app/routes/dashboard/components/scout/GuardianInfo";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector((state) => state.members);
  const { user } = useAuth0();
  const { isActive } = useMemberStatusDialog();

  // Hook personalizado para validar acceso del miembro
  const { hasAccess, reason, } = useMemberAccess();

  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [loadingGuardian, setLoadingGuardian] = useState(false);

  useEffect(() => {
    dispatch(fetchMembersWithBranchAction());
  }, [dispatch]);

  const currentUserEmail = user?.email;
  const scoutInfo = members.find((m) => m.email === currentUserEmail);


  useEffect(() => {
    const fetchGuardian = async () => {
      if (!scoutInfo) return;

      // Aseguramos compatibilidad entre guardian_id o guardianId
      const guardianId =
        (scoutInfo as { guardian_id?: number })?.guardian_id ??
        (scoutInfo as { guardianId?: number })?.guardianId ??
        (scoutInfo as { guardian?: { id?: number } })?.guardian?.id;


      if (!guardianId) {
        setGuardian(null);
        return;
      }

      setLoadingGuardian(true);
      try {
        const data = await guardianService.getGuardianById(guardianId);
        setGuardian(data);
      } catch (error) {
        console.error("Error al cargar acudiente:", error);
        setGuardian(null);
      } finally {
        setLoadingGuardian(false);
      }
    };

    fetchGuardian();
  }, [scoutInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        Cargando información...
      </div>
    );
  }

  // Mostrar modal de solicitud pendiente
  if (reason === "pending") {
    return <PendingApprovalModal isOpen={true} />;
  }

  // Mostrar modal de miembro inactivo
  if (reason === "inactive") {
    return <InactiveMemberModal isOpen={true} />;
  }

  // Si no tiene acceso por cualquier otra razón
  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        No tienes acceso al sistema. Por favor contacta a los administradores.
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 font-medium">
        Error al cargar datos: {error}
      </p>
    );
  }

  if (!scoutInfo) {
    return (
      <p className="text-center text-gray-600">
        No se encontró información del scout.
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-primary mb-3">
          ¡Hola, {scoutInfo.firstName}!
        </h1>
        <p className="text-xl text-gray-700">
          Bienvenido a tu panel personal de información scout
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Tarjeta de datos personales */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
              <User className="text-primary" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-lg">
            <p>
              <strong>Nombre:</strong> {scoutInfo.firstName}{" "}
              {scoutInfo.lastName}
            </p>
            <p>
              <strong>Identificación:</strong> {scoutInfo.identification}
            </p>
            <p>
              <strong>Correo:</strong> {scoutInfo.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {scoutInfo.phone || "No registrado"}
            </p>
            <p>
              <strong>Dirección:</strong> {scoutInfo.address || "No registrada"}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta de información scout */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
              <Flag className="text-primary" />
              Información Scout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-lg">
            <p>
              <strong>Grupo:</strong>{" "}
              {scoutInfo.subgroup?.groupId || "Sin grupo asignado"}
            </p>
            <p>
              <strong>Rama:</strong>{" "}
              {scoutInfo.subgroup?.name || "Sin rama asignada"}
            </p>
            <p>
              <strong>Sección:</strong>{" "}
              {scoutInfo.subgroup?.section?.name || "Sin sección asignada"}
            </p>
            <p>
              <strong>Rol:</strong>{" "}
              {scoutInfo.role
                ? scoutInfo.role.charAt(0).toUpperCase() +
                scoutInfo.role.slice(1).toLowerCase()
                : "Sin rol"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {isActive(scoutInfo) ? (
                <span className="inline-block px-2 py-1 rounded-lg border border-green-300 bg-green-100 text-green-800 font-semibold">
                  Activo
                </span>
              ) : (
                <span className="inline-block px-2 py-1 rounded-lg border border-red-300 bg-red-100 text-red-800 font-semibold">
                  Inactivo
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div >

      <GuardianInfo guardian={guardian} loading={loadingGuardian} />

    </div>
  );
};

export default Dashboard;

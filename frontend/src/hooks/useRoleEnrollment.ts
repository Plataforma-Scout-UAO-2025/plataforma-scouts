import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { createMemberAction, createMemberAuth0Action } from "@/store/members/membersActions";
import { transformData } from "@/app/routes/grupos/basic-info/utils/enrollment.utils";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";

import type { ChangeEvent, PersonalData } from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";
import type { role } from "@/types/enrollment.type";

type useRoleEnrollmentProps = {
  role: role;
};

type useRoleEnrollmentReturn = {
  datosPersonales: PersonalData;
  setDatosPersonales: React.Dispatch<React.SetStateAction<PersonalData>>;

  pagina: number;
  setPagina: React.Dispatch<React.SetStateAction<number>>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;

  progreso: number;
  loadingSubmit: boolean;

  handlePersonalChange: (e: ChangeEvent) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useRoleEnrollment({ role }: useRoleEnrollmentProps): useRoleEnrollmentReturn {
  const dispatch = useAppDispatch();
  const { loading: loadingSubmit } = useMember();
  const { orgId } = useAuth0ApiWrapper();

  const [pagina, setPagina] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [datosPersonales, setDatosPersonales] = useState<PersonalData>({
    firstname: "",
    lastname: "",
    email: "",
    confirm_email: "",
    username: "",
    password: "",
    confirm_password: "",
    document_type: "",
    identification: "",
    birth_date: "",
    address: "",
    phone: "",
    gender: "",
    weight: "",
    height: "",
    tenantId: "",
  });

  useEffect(() => {
    if (orgId) {
      setDatosPersonales((prev) => ({ ...prev, tenantId: orgId }));
    }
  }, [orgId]);

  const handlePersonalChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosPersonales((prev) => ({ ...prev, [name]: value }));
  }, []);

  const enviarDatos = useCallback(async () => {
    try {
      if (!datosPersonales.username || !datosPersonales.password) {
        alert("El nombre de usuario y la contraseña son obligatorios");
        return;
      }

      const auth0Result = await dispatch(
        createMemberAuth0Action({
          email: datosPersonales.email,
          password: datosPersonales.password,
          username: datosPersonales.username,
          role: role,
        })
      );

      if (createMemberAuth0Action.rejected.match(auth0Result)) {
        const errorMessage = auth0Result.payload?.error || "Error desconocido al crear usuario en Auth0";
        alert(`No se pudo crear el usuario en Auth0: ${errorMessage}`);
        return;
      }

      const tenant = orgId ?? datosPersonales.tenantId ?? "";
      if (!tenant) {
        alert("No se pudo determinar el tenant del usuario (org_id).");
        return;
      }

      const memberData: Member = transformData({
        ...datosPersonales,
        tenantId: tenant,
      });

      await dispatch(createMemberAction(memberData)).unwrap();
      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Error al enviar la solicitud.");
    }
  }, [datosPersonales, orgId, role, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (pagina === 1) {
        if (datosPersonales.email !== datosPersonales.confirm_email) {
          alert("Los correos electrónicos no coinciden");
          return;
        }
        if (!datosPersonales.username || !datosPersonales.password) {
          alert("Nombre de usuario y contraseña son obligatorios");
          return;
        }
        if (datosPersonales.password !== datosPersonales.confirm_password) {
          alert("Las contraseñas no coinciden");
          return;
        }
        setPagina(2);
        return;
      }

      await enviarDatos();
    },
    [
      pagina,
      datosPersonales.email,
      datosPersonales.username,
      datosPersonales.password,
      datosPersonales.confirm_password,
      datosPersonales.confirm_email,
      enviarDatos,
    ]
  );

  const totalPaginas = useMemo(() => 2, []);
  const progreso = useMemo(() => (pagina / totalPaginas) * 100, [pagina, totalPaginas]);

  return {
    datosPersonales,
    setDatosPersonales,
    pagina,
    setPagina,
    showModal,
    setShowModal,
    progreso,
    loadingSubmit,
    handlePersonalChange,
    handleSubmit,
  };
}
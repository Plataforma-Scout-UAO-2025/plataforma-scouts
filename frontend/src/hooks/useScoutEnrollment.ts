import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import {
  createMemberAction,
  createMemberWithSchoolDataAction,
  createScoutAuth0Action,
} from "@/store/members/membersActions";
import { transformData } from "@/app/routes/grupos/basic-info/utils/enrollment.utils";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useRoleContext } from "@/hooks/useRoleContext";
import { normalizeRawRole } from "@/roles/roles";

import type {
  ChangeEvent,
  CreateMemberWithSchoolRequest,
  PersonalData,
  SchoolData,
} from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";

type UseScoutEnrollmentReturn = {
  datosPersonales: PersonalData;
  setDatosPersonales: React.Dispatch<React.SetStateAction<PersonalData>>;
  datosEscolares: SchoolData;
  setDatosEscolares: React.Dispatch<React.SetStateAction<SchoolData>>;

  pagina: number;
  setPagina: React.Dispatch<React.SetStateAction<number>>;
  incluirDatosEscolares: boolean;
  showSchoolDialog: boolean;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;

  totalPaginas: number;
  progreso: number;
  loadingSubmit: boolean;

  handlePersonalChange: (e: ChangeEvent) => void;
  handleSchoolChange: (e: ChangeEvent) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSchoolDialogResponse: (incluir: boolean) => void;
};

export function useScoutEnrollment(): UseScoutEnrollmentReturn {
  const dispatch = useAppDispatch();
  const { loading: loadingSubmit } = useMember();
  const { orgId } = useAuth0ApiWrapper();
  const { currentUserRole } = useRoleContext();

  const [pagina, setPagina] = useState(1);
  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [incluirDatosEscolares, setIncluirDatosEscolares] = useState(false);
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
    hobbies: "",
    sports: "",
    instruments: "",
    tenantId: "",
    role: "SCOUT",
    emergency_contacts: [{ name: "", relationship: "", phone: "" }],
  });

  useEffect(() => {
    if (orgId) {
      setDatosPersonales((prev) => ({ ...prev, tenantId: orgId }));
    }
  }, [orgId]);

  const [datosEscolares, setDatosEscolares] = useState<SchoolData>({
    institution: "",
    course: "",
    calendar: "",
    shift: "",
  });

  const handlePersonalChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosPersonales((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSchoolChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosEscolares((prev) => ({ ...prev, [name]: value }));
  }, []);

  const enviarDatos = useCallback(async () => {
    try {
      if (!datosPersonales.username || !datosPersonales.password) {
        alert(
          "username y password son obligatorios para crear la cuenta de Auth0",
        );
        return;
      }

      const auth0Result = await dispatch(
        createScoutAuth0Action({
          email: datosPersonales.email,
          password: datosPersonales.password,
          username: datosPersonales.username,
        })
      );

      if (createScoutAuth0Action.rejected.match(auth0Result)) {
        const errorMessage = auth0Result.payload?.error || "Error desconocido al crear usuario en Auth0";
        alert(`No se pudo crear el usuario en Auth0: ${errorMessage}`);
        return;
      }

      const tenant = orgId ?? datosPersonales.tenantId ?? "";
      if (!tenant) {
        alert("No se pudo determinar el tenant del usuario (org_id).");
        return;
      }

      // Normalizar el rol del usuario actual
      const normalizedUserRole = normalizeRawRole(currentUserRole);

      const memberData: Member = transformData(
        {
          ...datosPersonales,
          tenantId: tenant,
        },
        normalizedUserRole
      );

      if (incluirDatosEscolares) {
        const requestData: CreateMemberWithSchoolRequest = {
          member: memberData,
          school: datosEscolares,
        };
        await dispatch(
          createMemberWithSchoolDataAction({ memberData: requestData }),
        ).unwrap();
      } else {
        await dispatch(createMemberAction(memberData)).unwrap();
      }
      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Error al enviar la solicitud.");
    }
  }, [datosPersonales, incluirDatosEscolares, datosEscolares, orgId, currentUserRole, dispatch]);

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

      if (pagina === 2) {
        setShowSchoolDialog(true);
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
    ],
  );

  const handleSchoolDialogResponse = useCallback(
    (incluir: boolean) => {
      setIncluirDatosEscolares(incluir);
      setShowSchoolDialog(false);
      if (incluir) setPagina(3);
      else void enviarDatos();
    },
    [enviarDatos],
  );

  const totalPaginas = useMemo(
    () => (incluirDatosEscolares ? 3 : 2),
    [incluirDatosEscolares],
  );

  const progreso = useMemo(
    () => (pagina / totalPaginas) * 100,
    [pagina, totalPaginas],
  );

  return {
    datosPersonales,
    setDatosPersonales,
    datosEscolares,
    setDatosEscolares,

    pagina,
    setPagina,
    incluirDatosEscolares,
    showSchoolDialog,
    showModal,
    setShowModal,

    totalPaginas,
    progreso,
    loadingSubmit,

    handlePersonalChange,
    handleSchoolChange,
    handleSubmit,
    handleSchoolDialogResponse,
  };
}

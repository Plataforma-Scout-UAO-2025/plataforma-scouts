import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { useFormValidation } from "@/hooks/useFormValidation";
import {
  createMemberAction,
  createMemberWithSchoolDataAction,
  createScoutAuth0Action,
} from "@/store/members/membersActions";
import { transformData } from "@/app/routes/grupos/basic-info/utils/enrollment.utils";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useRoleContext } from "@/hooks/useRoleContext";
import { normalizeRawRole } from "@/roles/roles";
import {
  page1Schema,
  page2Schema,
  page3Schema,
} from "@/schemas/enrollment.schema";
import type {
  ChangeEvent,
  CreateMemberWithSchoolRequest,
  PersonalData,
  SchoolData,
} from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";

type ApiError = {
  message?: string;
  error?: string;
  detail?: string;
  status?: number;
};

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
  showUserExistsDialog: boolean;
  setShowUserExistsDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showAuth0ErrorDialog: boolean;
  setShowAuth0ErrorDialog: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  totalPaginas: number;
  progreso: number;
  loadingSubmit: boolean;
  errors: Record<string, string>;
  handlePersonalChange: (e: ChangeEvent) => void;
  handleEmergencyContactsChange: (updatedData: PersonalData) => void;
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
  const [showUserExistsDialog, setShowUserExistsDialog] = useState(false);
  const [showAuth0ErrorDialog, setShowAuth0ErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const page1Validation = useFormValidation(page1Schema);
  const page2Validation = useFormValidation(page2Schema);
  const page3Validation = useFormValidation(page3Schema);

  const getCurrentErrors = useCallback(() => {
    if (pagina === 1) return page1Validation.errors;
    if (pagina === 2) return page2Validation.errors;
    return page3Validation.errors;
  }, [
    pagina,
    page1Validation.errors,
    page2Validation.errors,
    page3Validation.errors,
  ]);

  const handlePersonalChange = useCallback(
    (e: ChangeEvent) => {
      const { name, value } = e.target;
      setDatosPersonales((prev) => {
        const newData = { ...prev, [name]: value };

        if (pagina === 1) {
          setTimeout(() => {
            page1Validation.validateField(name, value, newData);
          }, 0);
        } else if (pagina === 2) {
          setTimeout(() => {
            page2Validation.validateField(name, value, newData);
          }, 0);
        }

        return newData;
      });
    },
    [pagina, page1Validation, page2Validation]
  );

  const handleSchoolChange = useCallback(
    (e: ChangeEvent) => {
      const { name, value } = e.target;
      setDatosEscolares((prev) => {
        const newData = { ...prev, [name]: value };
        if (pagina === 3) {
          setTimeout(() => {
            page3Validation.validateField(name, value, newData);
          }, 0);
        }
        return newData;
      });
    },
    [pagina, page3Validation]
  );

  const handleEmergencyContactsChange = useCallback(
    (updatedData: PersonalData) => {
      if (pagina === 1) {
        page1Validation.validate(updatedData);
      }
    },
    [pagina, page1Validation]
  );

  const validateCurrentPage = useCallback((): boolean => {
    if (pagina === 1) {
      const isValid = page1Validation.validate(datosPersonales);

      if (!isValid) {
        console.log("Errores de validación página 1:", page1Validation.errors);
      }
      return isValid;
    }
    if (pagina === 2) {
      return page2Validation.validate(datosPersonales);
    }

    if (pagina === 3) {
      return page3Validation.validate(datosEscolares);
    }

    return false;
  }, [
    pagina,
    datosPersonales,
    datosEscolares,
    page1Validation,
    page2Validation,
    page3Validation,
  ]);

  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const firstErrorElement =
        document.querySelector('[class*="border-red"]') ||
        document.querySelector(".text-red-600");

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }, []);

  const enviarDatos = useCallback(async () => {
    try {
      const auth0Result = await dispatch(
        createScoutAuth0Action({
          email: datosPersonales.email,
          password: datosPersonales.password,
          username: datosPersonales.username,
        })
      );

      if (createScoutAuth0Action.rejected.match(auth0Result)) {
        const error = auth0Result.payload as ApiError;
        let mensaje = "Error desconocido al crear usuario en Auth0";

        if (error?.detail) {
          mensaje = error.detail;
        } else if (error?.message) {
          mensaje = error.message;
        } else if (error?.error) {
          mensaje = error.error;
        }

        if (
          mensaje.toLowerCase().includes("already exists") ||
          mensaje.toLowerCase().includes("ya existe")
        ) {
          mensaje =
            "El email o nombre de usuario ya está registrado en el sistema";
        }

        setErrorMessage(mensaje);
        setShowAuth0ErrorDialog(true);
        return;
      }

      const tenant = orgId ?? datosPersonales.tenantId ?? "";
      if (!tenant) {
        setErrorMessage("No se pudo determinar el tenant del usuario (org_id)");
        setShowAuth0ErrorDialog(true);
        return;
      }

      const normalizedUserRole = normalizeRawRole(currentUserRole);

      const memberData: Member = transformData(
        {
          ...datosPersonales,
          tenantId: tenant,
        },
        normalizedUserRole
      );

      let memberResult;

      if (incluirDatosEscolares) {
        const requestData: CreateMemberWithSchoolRequest = {
          member: memberData,
          school: datosEscolares,
        };
        memberResult = await dispatch(
          createMemberWithSchoolDataAction({ memberData: requestData })
        );
      } else {
        memberResult = await dispatch(createMemberAction(memberData));
      }

      const isRejected = incluirDatosEscolares
        ? createMemberWithSchoolDataAction.rejected.match(memberResult)
        : createMemberAction.rejected.match(memberResult);

      if (isRejected) {
        const error = memberResult.payload as ApiError;
        let mensaje = "Error al crear el miembro";

        if (error?.message) {
          mensaje = error.message;
        }

        if (
          mensaje.includes("already exists") ||
          mensaje.includes("ya existe") ||
          mensaje.includes("identification")
        ) {
          setShowUserExistsDialog(true);
          return;
        }

        setErrorMessage(mensaje);
        setShowAuth0ErrorDialog(true);
        return;
      }

      page1Validation.clearErrors();
      page2Validation.clearErrors();
      page3Validation.clearErrors();

      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);

      let mensaje = "Error inesperado al procesar la solicitud";

      if (error instanceof Error) {
        mensaje = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const responseError = error as {
          response?: { data?: { message?: string } };
        };
        if (responseError.response?.data?.message) {
          mensaje = responseError.response.data.message;
        }
      }

      setErrorMessage(mensaje);
      setShowAuth0ErrorDialog(true);
    }
  }, [
    datosPersonales,
    incluirDatosEscolares,
    datosEscolares,
    orgId,
    currentUserRole,
    dispatch,
    page1Validation,
    page2Validation,
    page3Validation,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateCurrentPage()) {
        scrollToFirstError();
        return;
      }

      if (pagina === 1) {
        setPagina(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (pagina === 2) {
        setShowSchoolDialog(true);
        return;
      }

      await enviarDatos();
    },
    [pagina, validateCurrentPage, scrollToFirstError, enviarDatos]
  );

  const handleSchoolDialogResponse = useCallback(
    (incluir: boolean) => {
      setIncluirDatosEscolares(incluir);
      setShowSchoolDialog(false);
      if (incluir) {
        setPagina(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        void enviarDatos();
      }
    },
    [enviarDatos]
  );

  const totalPaginas = useMemo(
    () => (incluirDatosEscolares ? 3 : 2),
    [incluirDatosEscolares]
  );

  const progreso = useMemo(
    () => (pagina / totalPaginas) * 100,
    [pagina, totalPaginas]
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
    showUserExistsDialog,
    setShowUserExistsDialog,
    showAuth0ErrorDialog,
    setShowAuth0ErrorDialog,
    errorMessage,
    totalPaginas,
    progreso,
    loadingSubmit,
    errors: getCurrentErrors(),
    handlePersonalChange,
    handleEmergencyContactsChange,
    handleSchoolChange,
    handleSubmit,
    handleSchoolDialogResponse,
  };
}
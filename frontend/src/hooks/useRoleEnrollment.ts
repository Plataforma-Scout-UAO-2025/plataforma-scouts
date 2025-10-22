import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { useFormValidation } from "@/hooks/useFormValidation";
import {
  createMemberAction,
  createMemberAuth0Action,
} from "@/store/members/membersActions";
import { transformData } from "@/app/routes/grupos/basic-info/utils/enrollment.utils";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useRoleContext } from "@/hooks/useRoleContext";
import { normalizeRawRole } from "@/roles/roles";
import { personalDataBaseSchema } from "@/schemas/enrollment.schema";
import type { ChangeEvent, PersonalData } from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";
import type { role } from "@/types/enrollment.type";

type ApiError = {
  message?: string;
  error?: string;
  detail?: string;
  status?: number;
};

type useRoleEnrollmentProps = {
  role: role;
  totalPaginas: number;
};

type useRoleEnrollmentReturn = {
  datosPersonales: PersonalData;
  setDatosPersonales: React.Dispatch<React.SetStateAction<PersonalData>>;
  pagina: number;
  setPagina: React.Dispatch<React.SetStateAction<number>>;
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
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

export function useRoleEnrollment({
  role,
  totalPaginas,
}: useRoleEnrollmentProps): useRoleEnrollmentReturn {
  const dispatch = useAppDispatch();
  const { loading: loadingSubmit } = useMember();
  const { orgId } = useAuth0ApiWrapper();
  const { currentUserRole } = useRoleContext();
  const [pagina, setPagina] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showUserExistsDialog, setShowUserExistsDialog] = useState(false);
  const [showAuth0ErrorDialog, setShowAuth0ErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
    role,
  });

  useEffect(() => {
    if (orgId) {
      setDatosPersonales((prev) => ({ ...prev, tenantId: orgId }));
    }
  }, [orgId]);

  const validation = useFormValidation(personalDataBaseSchema);

  const handlePersonalChange = useCallback(
    (e: ChangeEvent) => {
      const { name, value } = e.target;

      setDatosPersonales((prev) => {
        const newData = { ...prev, [name]: value };

        setTimeout(() => {
          validation.validateField(name, value, newData);
        }, 0);

        return newData;
      });
    },
    [validation]
  );

  const validateCurrentPage = useCallback((): boolean => {
    const isValid = validation.validate(datosPersonales);
    if (!isValid) {
      console.log("Errores de validación:", validation.errors);
    }

    return isValid;
  }, [datosPersonales, validation]);

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
      if (!datosPersonales.username || !datosPersonales.password) {
        setErrorMessage(
          "El nombre de usuario y la contraseña son obligatorios"
        );
        setShowAuth0ErrorDialog(true);
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
          role,
        },
        normalizedUserRole
      );

      const memberResult = await dispatch(createMemberAction(memberData));

      if (createMemberAction.rejected.match(memberResult)) {
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

      validation.clearErrors();
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
  }, [datosPersonales, orgId, role, currentUserRole, dispatch, validation]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateCurrentPage()) {
        scrollToFirstError();
        return;
      }

      if (pagina < totalPaginas) {
        setPagina((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      await enviarDatos();
    },
    [pagina, totalPaginas, validateCurrentPage, scrollToFirstError, enviarDatos]
  );

  const progreso = useMemo(
    () => (pagina / totalPaginas) * 100,
    [pagina, totalPaginas]
  );

  return {
    datosPersonales,
    setDatosPersonales,
    pagina,
    setPagina,
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
    errors: validation.errors,
    handlePersonalChange,
    handleSubmit,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import {
  createMemberAction,
  createMemberWithSchoolDataAction,
} from "@/store/members/membersActions";
import { getAllTenants, getGroupsByTenant } from "@/api/organigramaApi";
import { transformData } from "@/app/routes/grupos/basic-info/utils/enrollment.utils";

import type {
  ChangeEvent,
  CreateMemberWithSchoolRequest,
  PersonalData,
  SchoolData,
} from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";
import type { GroupResponseDTO, TenantDTO } from "@/types/group.type";

type UseScoutEnrollmentReturn = {

  datosPersonales: PersonalData;
  setDatosPersonales: React.Dispatch<React.SetStateAction<PersonalData>>;
  datosEscolares: SchoolData;
  setDatosEscolares: React.Dispatch<React.SetStateAction<SchoolData>>;
  groups: GroupResponseDTO[];
  loadingGroups: boolean;

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

  const [groups, setGroups] = useState<GroupResponseDTO[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [pagina, setPagina] = useState(1);
  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [incluirDatosEscolares, setIncluirDatosEscolares] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [datosPersonales, setDatosPersonales] = useState<PersonalData>({
    firstname: "",
    lastname: "",
    email: "",
    confirm_email: "",
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
    group: "",
    tenantId: "",
    emergency_contacts: [{ name: "", relationship: "", phone: "" }],
  });

  const [datosEscolares, setDatosEscolares] = useState<SchoolData>({
    institution: "",
    course: "",
    calendar: "",
    shift: "",
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const tenants = await getAllTenants<TenantDTO>();
        const promises = tenants.map((t) =>
          getGroupsByTenant<GroupResponseDTO>(t.slug)
        );
        const arrays = await Promise.all(promises);
        if (!mounted.current) return;
        setGroups(arrays.flat());
      } catch {
        alert("Error al cargar los grupos. Recarga la página.");
      } finally {
        if (mounted.current) setLoadingGroups(false);
      }
    };
    fetchGroups();
    return () => {
      mounted.current = false;
    };
  }, []);

  const handlePersonalChange = useCallback(
    (e: ChangeEvent) => {
      const { name, value } = e.target;
      if (name === "group") {
        const selected = groups.find((g) => g.name === value);
        setDatosPersonales((prev) => ({
          ...prev,
          [name]: value,
          tenantId: selected?.tenant_id || "",
        }));
      } else {
        setDatosPersonales((prev) => ({ ...prev, [name]: value }));
      }
    },
    [groups]
  );

  const handleSchoolChange = useCallback((e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosEscolares((prev) => ({ ...prev, [name]: value }));
  }, []);

  const enviarDatos = useCallback(async () => {
    try {
      const memberData: Member = transformData(datosPersonales);

      if (incluirDatosEscolares) {
        const requestData: CreateMemberWithSchoolRequest = {
          member: memberData,
          school: datosEscolares,
        };
        await dispatch(
          createMemberWithSchoolDataAction({ memberData: requestData })
        ).unwrap();
      } else {
        await dispatch(createMemberAction(memberData)).unwrap();
      }
      setShowModal(true);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Error al enviar la solicitud.");
    }
  }, [datosPersonales, incluirDatosEscolares, datosEscolares, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (pagina === 1) {
        if (datosPersonales.email !== datosPersonales.confirm_email) {
          alert("Los correos electrónicos no coinciden");
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
    [pagina, datosPersonales.email, datosPersonales.confirm_email, enviarDatos]
  );

  const handleSchoolDialogResponse = useCallback(
    (incluir: boolean) => {
      setIncluirDatosEscolares(incluir);
      setShowSchoolDialog(false);
      if (incluir) setPagina(3);
      else void enviarDatos();
    },
    [enviarDatos]
  );

  const totalPaginas = useMemo(() => (incluirDatosEscolares ? 3 : 2), [
    incluirDatosEscolares,
  ]);

  const progreso = useMemo(() => (pagina / totalPaginas) * 100, [pagina, totalPaginas]);

  return {
    datosPersonales,
    setDatosPersonales,
    datosEscolares,
    setDatosEscolares,
    groups,
    loadingGroups,

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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useMember } from "@/hooks/useMember";
import { 
  createMemberAction,
  createMemberWithSchoolDataAction,
 } from "@/store/members/membersActions";
import { getAllTenants, getGroupsByTenant } from "@/api/organigramaApi";
import { transformData } from "./utils/enrollment.utils";

import type {
  PersonalData,
  SchoolData,
  ChangeEvent,
  CreateMemberWithSchoolRequest,
} from "@/types/enrollment.type";
import type { Member } from "@/types/member.type";
import type { GroupResponseDTO, TenantDTO } from "@/types/group.type";

import PersonalDataForm from "./components/PersonalDataForm";
import InterestsForm from "./components/InterestsForm";
import SchoolDataForm from "./components/SchoolDataForm";
import SchoolDialog from "./components/SchoolDialog";
import SuccessModal from "./components/SuccessModal";

function ScoutEnrollment() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useMember();
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

  // Cargar grupos
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const tenants = await getAllTenants<TenantDTO>();
        const allGroupsPromises = tenants.map((tenant) =>
          getGroupsByTenant<GroupResponseDTO>(tenant.slug)
        );
        const allGroupsArrays = await Promise.all(allGroupsPromises);
        setGroups(allGroupsArrays.flat());
      } catch {
        alert("Error al cargar los grupos. Recarga la página.");
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handlePersonalChange = (e: ChangeEvent): void => {
    const { name, value } = e.target;
    if (name === "group") {
      const selectedGroup = groups.find((g) => g.name === value);
      setDatosPersonales((prev) => ({
        ...prev,
        [name]: value,
        tenantId: selectedGroup?.tenant_id || "",
      }));
    } else {
      setDatosPersonales((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSchoolChange = (e: ChangeEvent): void => {
    const { name, value } = e.target;
    setDatosEscolares((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
  };

  const enviarDatos = async (): Promise<void> => {
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
  };

  const handleSchoolDialogResponse = (incluir: boolean): void => {
    setIncluirDatosEscolares(incluir);
    setShowSchoolDialog(false);
    if (incluir) setPagina(3);
    else enviarDatos();
  };

  const getCamposPagina = () => {
    if (pagina === 1)
      return (
        <PersonalDataForm
          datos={datosPersonales}
          handleChange={handlePersonalChange}
          groups={groups}
          loadingGroups={loadingGroups}
          setDatos={setDatosPersonales}
        />
      );
    if (pagina === 2)
      return (
        <InterestsForm datos={datosPersonales} handleChange={handlePersonalChange} />
      );
    return (
      <SchoolDataForm datos={datosEscolares} handleChange={handleSchoolChange} />
    );
  };

  const totalPaginas = incluirDatosEscolares ? 3 : 2;
  const progreso = (pagina / totalPaginas) * 100;

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Inscríbete al grupo scout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {getCamposPagina()}

        <div className="col-span-full flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              pagina > 1 ? setPagina((p) => p - 1) : navigate("/")
            }
          >
            {pagina > 1 ? "Atrás" : "Cancelar"}
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Enviando..."
              : pagina === totalPaginas
              ? "Enviar"
              : "Continuar"}
          </Button>
        </div>
      </form>

      <div className="mt-8 max-w-4xl mx-auto">
        <Progress value={progreso} className="h-2 rounded-full" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Página {pagina} de {totalPaginas}
        </p>
      </div>

      <SchoolDialog
        open={showSchoolDialog}
        onResponse={handleSchoolDialogResponse}
      />

      <SuccessModal open={showModal} onClose={() => navigate("/")} />
    </div>
  );
}

export default ScoutEnrollment;

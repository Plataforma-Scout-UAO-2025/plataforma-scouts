import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalDataForm from "./components/PersonalDataForm";
import EmergencyContacts from "./components/EmergencyContacts";
import InterestsForm from "./components/InterestsForm";
import SchoolDataForm from "./components/SchoolDataForm";
import SchoolDialog from "./components/SchoolDialog";
import SuccessModal from "./components/SuccessModal";

import { useScoutEnrollment } from "@/hooks/useScoutEnrollment";

function ScoutEnrollment() {
  const navigate = useNavigate();

  const {
    datosPersonales,
    setDatosPersonales,
    datosEscolares,
    pagina,
    setPagina,
    showSchoolDialog,
    showModal,

    totalPaginas,
    progreso,
    loadingSubmit,

    handlePersonalChange,
    handleSchoolChange,
    handleSubmit,
    handleSchoolDialogResponse,
  } = useScoutEnrollment();

  const getCamposPagina = () => {
    if (pagina === 1)
      return (
        <>
        <PersonalDataForm
          datos={datosPersonales}
          handleChange={handlePersonalChange}
          setDatos={setDatosPersonales}
        />
        <EmergencyContacts datos={datosPersonales} setDatos={setDatosPersonales} />
      </>
      );
    if (pagina === 2)
      return (
        <InterestsForm datos={datosPersonales} handleChange={handlePersonalChange} />
      );
    return (
      <SchoolDataForm datos={datosEscolares} handleChange={handleSchoolChange} />
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Inscripción al grupo scout
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

          <Button type="submit" disabled={loadingSubmit}>
            {loadingSubmit
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

      <SchoolDialog open={showSchoolDialog} onResponse={handleSchoolDialogResponse} />

      <SuccessModal open={showModal} onClose={() => navigate("/app/dashboard")} />
    </div>
  );
}

export default ScoutEnrollment;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalDataForm from "./components/PersonalDataForm";
import EmergencyContacts from "./components/EmergencyContacts";
import InterestsForm from "./components/InterestsForm";
import SchoolDataForm from "./components/SchoolDataForm";
import SchoolDialog from "./components/SchoolDialog";
import SuccessModal from "./components/SuccessModal";
import { UserExistsDialog } from "./components/UserExistsDialog";
import { ErrorDialog } from "./components/ErrorDialog";

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
    setShowModal,
    showUserExistsDialog,
    setShowUserExistsDialog,
    showAuth0ErrorDialog,
    setShowAuth0ErrorDialog,
    errorMessage,
    totalPaginas,
    progreso,
    loadingSubmit,
    errors,
    handlePersonalChange,
    handleEmergencyContactsChange,
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
            errors={errors}
          />
          <EmergencyContacts
            datos={datosPersonales}
            setDatos={setDatosPersonales}
            onContactChange={handleEmergencyContactsChange}
            errors={errors}
          />
        </>
      );
    if (pagina === 2)
      return (
        <InterestsForm
          datos={datosPersonales}
          handleChange={handlePersonalChange}
          errors={errors}
        />
      );
    return (
      <SchoolDataForm
        datos={datosEscolares}
        handleChange={handleSchoolChange}
        errors={errors}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center md:text-left">
        Inscripción de Scout
      </h1>

      <div className="max-w-2xl mx-auto mb-8">
        <Progress value={progreso} className="h-2 bg-muted" />
        <p className="text-sm text-center mt-2 text-muted-foreground">
          Paso {pagina} de {totalPaginas}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto bg-card shadow-md rounded-2xl p-6"
      >
        {getCamposPagina()}

        <div className="col-span-full flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              pagina > 1 ? setPagina((p) => p - 1) : navigate("/app/miembros")
            }
          >
            {pagina > 1 ? "Atrás" : "Cancelar"}
          </Button>

          <Button type="submit" variant="primary" disabled={loadingSubmit}>
            {loadingSubmit
              ? "Enviando..."
              : pagina === totalPaginas
              ? "Finalizar inscripción"
              : "Siguiente"}
          </Button>
        </div>
      </form>

      <SchoolDialog
        open={showSchoolDialog}
        onResponse={handleSchoolDialogResponse}
      />

      <SuccessModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          navigate("/app/dashboard");
        }}
      />

      <UserExistsDialog
        open={showUserExistsDialog}
        onOpenChange={setShowUserExistsDialog}
        identification={datosPersonales.identification}
      />

      <ErrorDialog
        open={showAuth0ErrorDialog}
        onOpenChange={setShowAuth0ErrorDialog}
        title="Error en el registro"
        description={errorMessage}
      />
    </div>
  );
}

export default ScoutEnrollment;

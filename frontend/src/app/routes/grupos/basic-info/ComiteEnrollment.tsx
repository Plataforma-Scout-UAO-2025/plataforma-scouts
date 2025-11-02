import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalDataForm from "./components/PersonalDataForm";
import DataTreatmentConsent from "./components/DataTreatmentConsent";
import EmergencyContacts from "./components/EmergencyContacts";
import SuccessModal from "./components/SuccessModal";
import { useRoleEnrollment } from "@/hooks/useRoleEnrollment";
import { UserExistsDialog } from "./components/UserExistsDialog";
import { ErrorDialog } from "./components/ErrorDialog";

function ComiteAdminEnrollment() {
  const navigate = useNavigate();

  const {
    datosPersonales,
    setDatosPersonales,
    pagina,
    totalPaginas,
    progreso,
    showModal,
    showUserExistsDialog,
    setShowUserExistsDialog,
    showAuth0ErrorDialog,
    setShowAuth0ErrorDialog,
    errorMessage,
    loadingSubmit,
    errors,
    handlePersonalChange,
    handleEmergencyContactsChange,
    handleSubmit,
  } = useRoleEnrollment({ role: "COMITE_ADMIN", totalPaginas: 2 });

  const handleConsentChange = (value: boolean) => {
    setDatosPersonales((prev) => ({
      ...prev,
      accept_treatment: value,
    }));
  };

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

    return (
      <DataTreatmentConsent
        value={datosPersonales.accept_treatment}
        onChange={handleConsentChange}
        error={errors.data_treatment_consent}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary text-center md:text-left">
        Inscripción Comité Administrativo
      </h1>
      <div className="max-w-2xl mx-auto mt-8 mb-3">
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
            onClick={() => {
              if (pagina === 1) {
                navigate("/app/miembros");
              } else {
                window.location.reload();
              }
            }}
          >
            {pagina === 1 ? "Cancelar" : "Atrás"}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              loadingSubmit ||
              (pagina === 2 && datosPersonales.accept_treatment === false)
            }
          >
            {loadingSubmit
              ? "Enviando..."
              : pagina === totalPaginas
                ? "Finalizar inscripción"
                : "Siguiente"}
          </Button>
        </div>
      </form>

      {/* Modal de éxito */}
      <SuccessModal
        open={showModal}
        onClose={() => navigate("/app/miembros")}
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

export default ComiteAdminEnrollment;

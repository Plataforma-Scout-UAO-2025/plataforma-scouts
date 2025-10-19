import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalDataForm from "./components/PersonalDataForm";
import SuccessModal from "./components/SuccessModal";

import { useRoleEnrollment } from "@/hooks/useRoleEnrollment";

function TreasurerEnrollment() {
  const navigate = useNavigate();

  const {
    datosPersonales,
    setDatosPersonales,
    pagina,
    totalPaginas,
    progreso,
    showModal,
    loadingSubmit,
    handlePersonalChange,
    handleSubmit,
  } = useRoleEnrollment({ role: "TESORERO", totalPaginas: 1 });

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center md:text-left">
        Inscripción de Tesorero
      </h1>

      {/* Barra de progreso */}
      <div className="max-w-2xl mx-auto mb-8">
        <Progress value={progreso} className="h-2 bg-muted" />
        <p className="text-sm text-center mt-2 text-muted-foreground">
          Paso {pagina} de {totalPaginas}
        </p>
      </div>

      {/* Formulario principal */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto bg-card shadow-md rounded-2xl p-6"
      >
        {/* Sección de datos personales */}
        <PersonalDataForm
          datos={datosPersonales}
          handleChange={handlePersonalChange}
          setDatos={setDatosPersonales}
        />

        {/* Controles inferiores */}
        <div className="col-span-full flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/app/miembros")}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={loadingSubmit}
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
        onClose={() => navigate("/app/dashboard")}
      />
    </div>
  );
}

export default TreasurerEnrollment;
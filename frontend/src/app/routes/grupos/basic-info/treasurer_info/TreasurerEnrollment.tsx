import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PersonalDataForm from "../components/PersonalDataForm";
import SuccessModal from "../components/SuccessModal";

import { useTreasurerEnrollment } from "@/hooks/useTreasurerEnrollment";

function TreasurerEnrollment() {
  const navigate = useNavigate();

  const {
    datosPersonales,
    setDatosPersonales,
    showModal,
    loadingSubmit,
    handlePersonalChange,
    handleSubmit,
  } = useTreasurerEnrollment();

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Inscribe a un tesorero
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        <PersonalDataForm
          datos={datosPersonales}
          handleChange={handlePersonalChange}
          setDatos={setDatosPersonales}
        />

        <div className="col-span-full flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </Button>

          <Button type="submit" disabled={loadingSubmit}>
            {loadingSubmit ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={showModal}
        onClose={() => navigate("/app/dashboard")}
      />
    </div>
  );
}

export default TreasurerEnrollment;

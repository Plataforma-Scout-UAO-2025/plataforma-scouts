import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PersonalDataForm from "./components/PersonalDataForm";
import EmergencyContacts from "./components/EmergencyContacts";
import InterestsForm from "./components/InterestsForm";
import ScoutDataTreatmentConsent from "./components/Authorization";
import SchoolDataForm from "./components/SchoolDataForm";
import SchoolDialog from "./components/SchoolDialog";
import SuccessModal from "./components/SuccessModal";
import { UserExistsDialog } from "./components/UserExistsDialog";
import { ErrorDialog } from "./components/ErrorDialog";

import { useScoutEnrollment } from "@/hooks/useScoutEnrollment";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";

function ScoutEnrollment() {
  const navigate = useNavigate();
  const { orgId, isLoading: authLoading } = useAuth0ApiWrapper();

  const {
    sections,
    subgroups,
    selectedGroupSlug,
    selectedSection,
    setSelectedSection,
    selectedSubgroup,
    setSelectedSubgroup,
    loadingSections,
    loadingSubgroups,
  } = useOrgStructure({
    orgId: orgId || "",
    open: true,
  });

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
  } = useScoutEnrollment({
    selectedSection,
    selectedSubgroup,
  });

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
    if (pagina === 2)
      return (
        <>
          <InterestsForm
            datos={datosPersonales}
            handleChange={handlePersonalChange}
            errors={errors}
          />
          <ScoutDataTreatmentConsent
            value={datosPersonales.accept_treatment}
            onChange={handleConsentChange}
            error={errors.accept_treatment}
          />
        </>
      );
    if (pagina === 3)
      return (
        <SchoolDataForm
          datos={datosEscolares}
          handleChange={handleSchoolChange}
          errors={errors}
        />
      );

    // Página 4: Asignación organizacional
    return (
      <div className="col-span-full space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">
          Asignación Organizacional
        </h3>

        {/* Selector de Sección */}
        <div className="space-y-2">
          <Label htmlFor="section">Sección *</Label>
          <Select
            value={selectedSection}
            onValueChange={setSelectedSection}
            disabled={
              !selectedGroupSlug || loadingSections || sections.length === 0
            }
            required
          >
            <SelectTrigger
              id="section"
              className={errors.section ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Selecciona una sección" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={String(section.id)}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.section && (
            <p className="text-xs text-red-600">{errors.section}</p>
          )}
        </div>

        {/* Selector de Subgrupo */}
        <div className="space-y-2">
          <Label htmlFor="subgroup">Subgrupo *</Label>
          <Select
            value={selectedSubgroup}
            onValueChange={setSelectedSubgroup}
            disabled={
              !selectedSection || loadingSubgroups || subgroups.length === 0
            }
          >
            <SelectTrigger
              id="subgroup"
              className={errors.subgroup ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Selecciona un subgrupo" />
            </SelectTrigger>
            <SelectContent>
              {subgroups.map((subgroup) => (
                <SelectItem key={subgroup.id} value={String(subgroup.id)}>
                  {subgroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subgroup && (
            <p className="text-xs text-red-600">{errors.subgroup}</p>
          )}
        </div>
      </div>
    );
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

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
              pagina > 1 ? setPagina((p) => p - 1) : navigate("/app/dashboard")
            }
          >
            {pagina > 1 ? "Atrás" : "Cancelar"}
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              loadingSubmit ||
              (pagina === 2 && datosPersonales.accept_treatment === false) ||
              (pagina === 4 && (!selectedGroupSlug || !selectedSection || !selectedSubgroup))
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

      <SchoolDialog
        open={showSchoolDialog}
        onResponse={handleSchoolDialogResponse}
      />

      <SuccessModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          navigate("/app/miembros");
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

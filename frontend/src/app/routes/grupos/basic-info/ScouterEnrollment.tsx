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
import SuccessModal from "./components/SuccessModal";
import { useRoleEnrollment } from "@/hooks/useRoleEnrollment";
import { useOrgStructure } from "@/hooks/useOrgStructure";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { UserExistsDialog } from "./components/UserExistsDialog";
import { ErrorDialog } from "./components/ErrorDialog";

function ScouterEnrollment() {
  const navigate = useNavigate();
  const { orgId, isLoading: authLoading } = useAuth0ApiWrapper();
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
    handleSubmit,
  } = useRoleEnrollment({ role: "SCOUTER", totalPaginas: 1 });

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
        Inscripción de Scouter
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
          errors={errors}
        />

        {/* Sección de asignación organizacional */}
        <div className="col-span-full space-y-4 border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-primary">
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
              <SelectTrigger id="section">
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
              <SelectTrigger id="subgroup">
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
          </div>
        </div>

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
            disabled={
              loadingSubmit ||
              !selectedGroupSlug ||
              !selectedSection ||
              !selectedSubgroup
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
        onClose={() => navigate("/app/dashboard")}
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

export default ScouterEnrollment;

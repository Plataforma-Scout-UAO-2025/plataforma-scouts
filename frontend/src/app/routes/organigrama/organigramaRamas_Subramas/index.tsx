import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RamaList from "./components/RamaList";
import CreateRamaModal from "./components/CreateRamaModal";
import CreateSubramaModal from "./components/CreateSubramaModal";
import EditRamaModal from "./components/EditRamaModal";
import EditSubramaModal from "./components/EditSubramaModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import SuccessModal from "./components/SuccessModal";
import ErrorAlert from "./components/ErrorAlert";
import OrganigramaLoader from "./components/OrganigramaLoader";
import type {
  Branch as Rama,
  Subgroup as Subrama,
  CreateBranchData,
  CreateSubgroupData,
  UpdateBranchData,
  UpdateSubgroupData,
} from "./types/frontend";
import { useTenantParams } from "./hooks/useTenantParams";
import useOrganigramaActions from "./hooks/useOrganigramaActions";
import useOrganigramaExport from "./hooks/useOrganigramaExport";
import { useApiError } from "./hooks/useApiError";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import {
  fetchMembersWithBranchAction,
  fetchMembersAction,
} from "@/store/members/membersActions";
import { fetchRamasWithSubramasAction } from "@/store/organigrama/organigramaActions";
import { invalidateRamasCache } from "@/store/organigrama/organigramaSlice";
import {
  selectRamasWithCacheValidation,
  selectShouldFetchRamas,
  selectMemberCountBySubgroup,
} from "@/store/organigrama/selectors";
import { debounce } from "./utils/ramasProcessor";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Organigrama() {
  const [createRamaModalOpen, setCreateRamaModalOpen] = useState(false);
  const [createSubramaModalOpen, setCreateSubramaModalOpen] = useState(false);
  const [editRamaModalOpen, setEditRamaModalOpen] = useState(false);
  const [editSubramaModalOpen, setEditSubramaModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "rama" | "subrama";
    id: string;
    name: string;
    sectionId?: string;
    subgroupCount?: number;
    memberCount?: number;
  } | null>(null);

  const [selectedRamaId, setSelectedRamaId] = useState<string>("");
  const [ramaSeleccionada, setRamaSeleccionada] = useState<Rama | null>(null);
  const [subramaSeleccionada, setSubramaSeleccionada] =
    useState<Subrama | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    tenantId,
    groupSlug,
    isLoading: tenantLoading,
    isFetching,
    hasMissingParams,
    error: tenantError,
  } = useTenantParams();

  // Redux state para ramas
  const ramasState = useSelector(selectRamasWithCacheValidation);
  const shouldFetchRamas = useSelector(selectShouldFetchRamas);
  const getMemberCountBySubgroup = useSelector(selectMemberCountBySubgroup);

  // Obtener miembros del store de Redux
  const { members } = useSelector((state: RootState) => state.members);

  const { error, handleError, clearError } = useApiError();

  // Extraer datos del estado de ramas
  const { ramas, isLoading: dataLoading, error: ramasError } = ramasState;

  // Manejar errores de ramas
  useEffect(() => {
    if (ramasError) {
      handleError(new Error(ramasError));
    }
  }, [ramasError, handleError]);

  // Helper para contar miembros por subgrupo (usando selector optimizado)
  const countMembersBySubgroup = useCallback(
    (subgroupId: string | number): number => {
      return getMemberCountBySubgroup(subgroupId);
    },
    [getMemberCountBySubgroup]
  );

  // Debounced fetch function para ramas
  const debouncedFetchRamas = useMemo(
    () =>
      debounce((tenantId: string, groupSlug: string) => {
        console.log("🔄 [Component] Dispatching fetchRamasWithSubramasAction");
        dispatch(fetchRamasWithSubramasAction({ tenantId, groupSlug }));
      }, 100),
    [dispatch]
  );

  // Función para recargar ramas manualmente
  const loadRamas = useCallback(
    async (opts?: { force?: boolean }) => {
      if (tenantId && groupSlug) {
        const force = opts?.force || false;
        if (force) {
          console.log("🔄 [Component] Force refresh: invalidating cache");
          dispatch(invalidateRamasCache());
        }
        await dispatch(
          fetchRamasWithSubramasAction({ tenantId, groupSlug, force })
        );
      }
    },
    [dispatch, tenantId, groupSlug]
  );

  useEffect(() => {
    if (tenantError) {
      handleError(new Error(tenantError));
    }
  }, [tenantError, handleError]);

  // Cargar ramas con Redux
  useEffect(() => {
    if (tenantId && groupSlug && shouldFetchRamas) {
      console.log(
        "🎯 [Component] Should fetch ramas, dispatching debounced fetch"
      );
      debouncedFetchRamas(tenantId, groupSlug);
    }

    return () => {
      debouncedFetchRamas.cancel();
    };
  }, [tenantId, groupSlug, shouldFetchRamas, debouncedFetchRamas]);

  // Cargar miembros si no están disponibles
  useEffect(() => {
    if (members.length === 0) {
      // Preferir endpoint enriquecido (incluye relaciones subgroup/section); si falla, usar público
      (async () => {
        const enriched = await dispatch(fetchMembersWithBranchAction());
        if (fetchMembersWithBranchAction.rejected.match(enriched)) {
          await dispatch(fetchMembersAction());
        }
      })();
    }
  }, [dispatch, members.length]);

  const {
    createRama,
    updateRama,
    createSubrama,
    updateSubrama,
    deleteRama,
    deleteSubrama,
    successOpen,
    successMessage,
    closeSuccess,
  } = useOrganigramaActions({ tenantId, groupSlug, loadRamas, handleError });

  const { exportPDF, exportExcel } = useOrganigramaExport(ramas, {
    tenantId,
    groupSlug,
  });

  // ====== RAMAS ======
  const handleCreateRama = () => {
    setCreateRamaModalOpen(true);
  };

  const handleSubmitCreateRama = async (data: CreateBranchData) => {
    try {
      await createRama(data);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const handleEditRama = (rama: Rama) => {
    setRamaSeleccionada(rama);
    setEditRamaModalOpen(true);
  };

  const handleSubmitEditRama = async (data: UpdateBranchData) => {
    try {
      const payload: UpdateBranchData = { ...data };
      if (!payload.id && ramaSeleccionada) payload.id = ramaSeleccionada.id;
      await updateRama(payload);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const handleDeleteRama = (rama: Rama) => {
    // Contar subramas y miembros
    const subgroups = rama.subgroups ?? rama.subramas ?? [];
    const subgroupCount = subgroups.length;

    // Contar miembros totales en todas las subramas de esta rama
    let memberCount = 0;
    subgroups.forEach((subgroup) => {
      // Usar el ID del subgrupo si está disponible
      if (subgroup.id) {
        memberCount += countMembersBySubgroup(subgroup.id);
      }
    });

    setDeleteTarget({
      type: "rama",
      id: rama.id,
      name: rama.name ?? rama.nombre ?? "",
      subgroupCount,
      memberCount,
    });
    setConfirmDeleteOpen(true);
  };

  // ====== SUBRAMAS ======
  const handleCreateSubrama = (ramaId: string) => {
    setSelectedRamaId(ramaId);
    setCreateSubramaModalOpen(true);
  };

  const handleSubmitSubrama = async (data: CreateSubgroupData) => {
    return createSubrama(data);
  };

  const handleEditSubrama = (subrama: Subrama) => {
    setSubramaSeleccionada(subrama);
    setEditSubramaModalOpen(true);
  };

  const handleSubmitEditSubrama = async (data: UpdateSubgroupData) => {
    try {
      const payload: UpdateSubgroupData = { ...data };
      if (!payload.id && subramaSeleccionada)
        payload.id = subramaSeleccionada.id;
      await updateSubrama(payload);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const handleDeleteSubrama = (subrama: Subrama) => {
    const sectionId =
      subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? undefined;

    // Contar miembros asignados a esta subrama
    const memberCount = countMembersBySubgroup(subrama.id);

    setDeleteTarget({
      type: "subrama",
      id: subrama.id,
      name: subrama.name ?? subrama.nombre ?? "",
      sectionId,
      memberCount,
    });
    setConfirmDeleteOpen(true);
  };

  // ====== ELIMINACIÓN ======
  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (!tenantId || !groupSlug) {
        handleError(new Error("Tenant o group no disponibles para eliminar."));
        setConfirmDeleteOpen(false);
        return;
      }

      if (deleteTarget.type === "rama") {
        // Validar que la rama no tenga subramas o miembros
        const hasSubgroups = (deleteTarget.subgroupCount ?? 0) > 0;
        const hasMembers = (deleteTarget.memberCount ?? 0) > 0;

        if (hasSubgroups || hasMembers) {
          // No permitir eliminación si tiene subramas o miembros
          handleError(
            new Error(
              `No se puede eliminar la rama "${
                deleteTarget.name
              }" porque contiene ${
                deleteTarget.subgroupCount ?? 0
              } subrama(s) y ${
                deleteTarget.memberCount ?? 0
              } miembro(s). Elimina primero las subramas y reasigna los miembros.`
            )
          );
          setConfirmDeleteOpen(false);
          return;
        }

        await deleteRama(deleteTarget.id);
      } else {
        // Validar que la subrama no tenga miembros
        const hasMembers = (deleteTarget.memberCount ?? 0) > 0;

        if (hasMembers) {
          // No permitir eliminación si tiene miembros
          handleError(
            new Error(
              `No se puede eliminar la subrama "${
                deleteTarget.name
              }" porque contiene ${
                deleteTarget.memberCount ?? 0
              } miembro(s). Reasigna los miembros a otra subrama primero.`
            )
          );
          setConfirmDeleteOpen(false);
          return;
        }
        const sectionId = deleteTarget.sectionId;
        if (!sectionId) {
          if (!deleteTarget.id || !deleteTarget.id.includes("-")) {
            handleError(
              new Error(
                "No se puede determinar sectionId para eliminar la subrama."
              )
            );
            setConfirmDeleteOpen(false);
            return;
          }
          const fallbackSectionId = deleteTarget.id.split("-")[0];
          console.warn(
            "⚠️ [Organigrama] sectionId no disponible en deleteTarget, usando fallback",
            { fallbackSectionId }
          );
          await deleteSubrama(fallbackSectionId, deleteTarget.id);
        } else {
          await deleteSubrama(sectionId, deleteTarget.id);
        }
      }
      handleError(null);
    } catch (err) {
      handleError(err as unknown);
    }
    setConfirmDeleteOpen(false);
  };

  // ====== EXPORTAR ORGANIGRAMA ======
  const handleExportPDF = () => exportPDF();
  const handleExportExcel = () => exportExcel();

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Gestión de Ramas y Subramas Scouts
          </h1>
          <p className="text-muted-foreground">
            Administra la estructura de ramas y subramas de tu grupo scout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateRama}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            Crear Nueva Rama
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Exportar Datos</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleExportPDF}>
                Exportar en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Exportar en CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mostrar errores de la API  */}
      {error.hasError && (
        <ErrorAlert
          message={error.message}
          type={error.type}
          onClose={clearError}
        />
      )}

      {/* Controles de filtrado */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate("/app/organigrama")}
          className="text-sm"
        >
          Anterior
        </Button>
      </div>

      {/* Lista de ramas */}
      {/* Mostrar loader si el tenant/group o los datos están cargando y aún no hay ramas */}
      {(isFetching || tenantLoading || dataLoading) &&
      (!ramas || ramas.length === 0) ? (
        <OrganigramaLoader />
      ) : hasMissingParams && !isFetching && (!ramas || ramas.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No se pudo determinar el tenant o el grupo. Comprueba tu sesión o
            contacta al administrador.
          </p>
        </div>
      ) : (
        <RamaList
          ramas={ramas}
          onEditRama={handleEditRama}
          onDeleteRama={handleDeleteRama}
          onCreateSubrama={handleCreateSubrama}
          onEditSubrama={handleEditSubrama}
          onDeleteSubrama={handleDeleteSubrama}
        />
      )}

      {/* Modales */}
      <CreateRamaModal
        open={createRamaModalOpen}
        onOpenChange={setCreateRamaModalOpen}
        onSubmit={handleSubmitCreateRama}
        onSuccess={loadRamas}
      />

      <CreateSubramaModal
        open={createSubramaModalOpen}
        onOpenChange={setCreateSubramaModalOpen}
        ramaId={selectedRamaId}
        onSubmit={handleSubmitSubrama}
      />

      <EditRamaModal
        open={editRamaModalOpen}
        onOpenChange={setEditRamaModalOpen}
        rama={ramaSeleccionada}
        onSubmit={handleSubmitEditRama}
        onSuccess={loadRamas}
      />

      <EditSubramaModal
        open={editSubramaModalOpen}
        onOpenChange={setEditSubramaModalOpen}
        subrama={subramaSeleccionada}
        onSubmit={handleSubmitEditSubrama}
      />

      {/* Confirmación y Éxito */}
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={onConfirmDelete}
        onSuccess={loadRamas}
        title={`Confirmar Eliminación de ${
          deleteTarget?.type === "rama" ? "Rama" : "Subrama"
        }`}
        message={
          deleteTarget?.type === "rama"
            ? `¿Estás seguro de que quieres eliminar la rama "${
                deleteTarget?.name
              }"?${
                (deleteTarget?.subgroupCount ?? 0) > 0 ||
                (deleteTarget?.memberCount ?? 0) > 0
                  ? `\n\nEsta rama contiene:\n• ${
                      deleteTarget?.subgroupCount ?? 0
                    } subrama(s)\n• ${
                      deleteTarget?.memberCount ?? 0
                    } miembro(s)\n\nNo se puede eliminar hasta que esté vacía.`
                  : "\n\nEsta acción no se puede deshacer."
              }`
            : `¿Estás seguro de que quieres eliminar la subrama "${
                deleteTarget?.name
              }"?${
                (deleteTarget?.memberCount ?? 0) > 0
                  ? `\n\nEsta subrama contiene:\n• ${
                      deleteTarget?.memberCount ?? 0
                    } miembro(s)\n\nNo se puede eliminar hasta que esté vacía.`
                  : "\n\nEsta acción no se puede deshacer."
              }`
        }
        {...(((deleteTarget?.type === "rama" &&
          ((deleteTarget?.subgroupCount ?? 0) > 0 ||
            (deleteTarget?.memberCount ?? 0) > 0)) ||
          (deleteTarget?.type === "subrama" &&
            (deleteTarget?.memberCount ?? 0) > 0)) && {
          warning:
            deleteTarget?.type === "rama"
              ? `No se puede eliminar esta rama porque contiene ${
                  deleteTarget?.subgroupCount ?? 0
                } subrama(s) y ${deleteTarget?.memberCount ?? 0} miembro(s).`
              : `No se puede eliminar esta subrama porque contiene ${
                  deleteTarget?.memberCount ?? 0
                } miembro(s).`,
          disableConfirm: true,
        })}
      />

      <SuccessModal
        open={successOpen}
        message={successMessage}
        onClose={closeSuccess}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import ExportMenu from "./components/ExportMenu";
import LevelAccordion from "./components/LevelAccordion";
import { useNiveles } from "./hooks/useNiveles";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembersAction, fetchMembersWithBranchAction, assignSubgroupAndSectionAction } from "@/store/members/membersActions";
import type { RootState, AppDispatch } from "@/store/store";
// Importar submódulo de ramas/subramas para mostrar solo los acordeones de COMITÉ
import { useTenantParams } from "../organigramaRamas_Subramas/hooks/useTenantParams";
import useOrganigramaData from "../organigramaRamas_Subramas/hooks/useOrganigramaData";
import RamaList from "../organigramaRamas_Subramas/components/RamaList";
import { getSectionWithSubgroups, createSubgroup } from "@/api/organigramaApi";
import type { Subgroup } from "@/types/subgroup-simple.type";
import type { Member } from "@/types/member.type";

// 🔹 Modales importados
import CreateNivelModal from "./components/CreateNivelModal";
import EditNivelModal from "./components/EditNivelModal";
import CreateCargoModal from "./components/CreateCargoModal";
import EditCargoModal from "./components/EditCargoModal";
import AddMemberModal from "./components/AddMemberModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import SuccessModal from "./components/SuccessModal";

import type { Nivel, Cargo } from "./types/niveles.types";
 

export default function NivelesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading: membersLoading, error: membersError } = useSelector((state: RootState) => state.members);
  
  const currentYear = new Date().getFullYear();
  // Hooks del submódulo de ramas: deben invocarse en el mismo orden siempre
  const { tenantId, groupSlug } = useTenantParams();
  const { ramas } = useOrganigramaData(tenantId, groupSlug);

  const { anio, data, loading, addNivel, updateNivel, removeNivel, addCargo, updateCargo, removeCargo } =
    useNiveles(currentYear, tenantId, groupSlug);

  // ===== ESTADOS =====
  const [openCreateNivel, setOpenCreateNivel] = useState(false);
  const [openEditNivel, setOpenEditNivel] = useState(false);
  const [nivelToEdit, setNivelToEdit] = useState<Nivel | null>(null);

  const [openCreateCargo, setOpenCreateCargo] = useState(false);
  const [nivelActual, setNivelActual] = useState<Nivel | null>(null);
  const [initialCargoNombre, setInitialCargoNombre] = useState<string | undefined>(undefined);

  const [openEditCargo, setOpenEditCargo] = useState(false);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);

  // Modal para agregar miembros al cargo
  const [openAddMember, setOpenAddMember] = useState(false);
  const [cargoToAssign, setCargoToAssign] = useState<Cargo | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "nivel" | "cargo";
    id: string;
    name: string;
    nivelId?: string;
    cargoCount?: number;
    memberCount?: number;
    isSinCargo?: boolean;
  } | null>(null);
  const isSinCargoName = (name?: unknown): boolean => {
    if (name == null) return false;
    const s = String(name).trim().toLowerCase();
    return s === "sin cargo" || s === "sincargo" || s === "sin_cargo";
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  // Filtrar las ramas que sean comités (case-insensitive)
  const comiteRamas = (ramas ?? []).filter((r) => {
    const name = String(r.name || r.nombre || '').toLowerCase();
    return name.includes('comit');
  });

  // Forzar recarga de miembros por cargo en LevelAccordion cuando se asigna alguien
  const [membersRefreshKey, setMembersRefreshKey] = useState<number>(0);

  // Cargar miembros al montar el componente
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

  // ===== HANDLERS DE NIVELES =====

  const handleCreateNivel = (nombre: string, descripcion?: string) => {
    addNivel(nombre, descripcion);
    setOpenCreateNivel(false);
    setShowSuccess(true);
  };

  const handleEditNivel = (nivel: Nivel) => {
    updateNivel(nivel);
    setOpenEditNivel(false);
    setShowSuccess(true);
  };

  // ===== HANDLERS DE CARGOS =====

  // Abrir modal de crear cargo desde una rama (comité). Intentamos mapear la rama al nivel
  const handleCreateCargoFromRama = (ramaIdOrName: string) => {
    // Buscar nivel que coincida por palabra clave en el nombre
    const key = String(ramaIdOrName ?? '').toLowerCase();
    const encontrado = data.niveles.find((n) => {
      const nombre = (n.nombre || '').toLowerCase();
      return key && nombre.includes(key.split(' ')[0]);
    });

    if (encontrado) {
      setNivelActual(encontrado);
      setInitialCargoNombre('');
      setOpenCreateCargo(true);
      console.info('[NivelesPage] Abriendo Crear Cargo para nivel encontrado', encontrado.nombre);
      return;
    }

    // Si no encontramos por id/name, sólo abrimos el modal vacío
    setNivelActual(null);
    setInitialCargoNombre('');
    setOpenCreateCargo(true);
    console.warn('[NivelesPage] No se encontró un nivel mapeado para la rama:', ramaIdOrName);
  };

  const handleCreateCargo = (
    nombre: string,
    titular: string,
    descripcion?: string
  ) => {
    if (!nivelActual) return;
    // Guardado en backend (subgrupo). 'titular' no se persiste en backend actualmente.
    // Se mantiene para futura extensión.
    // Usamos el helper del hook para crear cargo y refrescar.
    (async () => {
      try {
        await addCargo(nivelActual.id, nombre, titular, descripcion);
        setOpenCreateCargo(false);
        setShowSuccess(true);
      } catch (e) {
        console.error('Error creando cargo', e);
      }
    })();
  };

  const handleEditCargo = (cargo: Cargo) => {
    setCargoToEdit(cargo);
    setOpenEditCargo(true);
  };

  const handleOpenAddMember = (nivel: Nivel, cargo: Cargo) => {
    setNivelActual(nivel);
    setCargoToAssign(cargo);
    setOpenAddMember(true);
  };

  const handleSaveEditCargo = (cargo: Cargo) => {
    if (!nivelActual) return;
    (async () => {
      try {
        await updateCargo(nivelActual.id, cargo);
        setOpenEditCargo(false);
        setShowSuccess(true);
      } catch (e) {
        console.error('Error actualizando cargo', e);
      }
    })();
  };

  const handleDeleteCargo = (cargo: Cargo, nivel: Nivel) => {
    // Contar miembros asociados a este cargo (subgroup)
    const cargoIdNum = toNumberSafe((cargo as unknown as { id?: unknown }).id);
    const memberCount = cargoIdNum !== undefined && members && members.length > 0
      ? members.reduce((acc, m) => acc + (getMemberSubgroupId(m) === cargoIdNum ? 1 : 0), 0)
      : 0;
    setDeleteTarget({
      type: "cargo",
      id: cargo.id,
      name: cargo.nombre,
      nivelId: nivel.id,
      memberCount,
      isSinCargo: isSinCargoName(cargo.nombre),
    });
    setOpenDelete(true);
  };

  const handleAssignMemberToCargo = async (memberId: string) => {
    if (!nivelActual || !cargoToAssign) return;
    try {
      // Normalizar a número el id de subgrupo (cargo)
      let subgroupNumId = Number(cargoToAssign.id);
      if (!Number.isFinite(subgroupNumId)) {
        const parsed = parseInt(String(cargoToAssign.id), 10);
        if (Number.isFinite(parsed)) subgroupNumId = parsed;
      }
      if (Number.isFinite(subgroupNumId)) {
        // También enviamos la sección padre (nivel) para máxima compatibilidad con backend
        let sectionNumId = Number(nivelActual.id);
        if (!Number.isFinite(sectionNumId)) {
          const parsedSec = parseInt(String(nivelActual.id), 10);
          if (Number.isFinite(parsedSec)) sectionNumId = parsedSec;
        }
        // Usar endpoint dedicado con permisos adecuados
        // Preparar memberId (número si es posible)
        const memberIdNum = Number(memberId);
        const memberIdToSend: number | string = Number.isFinite(memberIdNum)
          ? memberIdNum
          : memberId;

        const resultAction = await dispatch(
          assignSubgroupAndSectionAction({
            memberId: memberIdToSend,
            subGroupId: subgroupNumId,
            sectionId: Number.isFinite(sectionNumId) ? sectionNumId : undefined,
          })
        );
        // Mostrar éxito solo si la acción se resolvió correctamente
        if (assignSubgroupAndSectionAction.fulfilled.match(resultAction)) {
          setShowSuccess(true);
          // Refrescar miembros desde el backend para que el listado por cargo se actualice
          // Preferir endpoint enriquecido (relaciones actualizadas); fallback al público si falla
          const r1 = await dispatch(fetchMembersWithBranchAction());
          if (fetchMembersWithBranchAction.rejected.match(r1)) {
            await dispatch(fetchMembersAction());
          }
          setMembersRefreshKey((k) => k + 1);
        } else {
          console.error("Error al asignar subgrupo/sección: ", resultAction);
        }
      } else {
        console.warn("No se pudo parsear el id del cargo para asignación de miembro", cargoToAssign.id);
      }
      } catch (e) {
      console.error('Error asignando miembro al cargo', e);
    } finally {
      setOpenAddMember(false);
    }
  };

  // Desasignar miembro de un cargo: lo movemos a un subgrupo "Sin cargo" dentro del mismo nivel (sección)
  const handleRemoveMemberFromCargo = async (nivel: Nivel, _cargo: Cargo, memberId: string) => {
    try {
      // 1) Asegurar existencia de subgrupo "Sin cargo" en la sección (nivel)
      const sectionId = nivel.id;
      // Nota: necesitamos tenantId y groupSlug del contexto
      let sinCargoSubgroupId: number | undefined;
      if (tenantId && groupSlug && sectionId) {
        const { subgroups } = await getSectionWithSubgroups(sectionId, tenantId, groupSlug);
        const found = (subgroups as Subgroup[] || []).find((sg) => String(sg.name || (sg as unknown as { nombre?: string }).nombre || "").toLowerCase() === "sin cargo");
        if (found) {
          sinCargoSubgroupId = Number(found.subgroupId ?? found.id);
        } else {
          // Crear subgrupo "Sin cargo"
          const created = await createSubgroup(
            sectionId,
            { name: "Sin cargo", description: "Miembros no asignados" } as unknown as Omit<Subgroup, "id" | "subgroupId" | "tenantId" | "groupId" | "sectionId" | "createdAt" | "updatedAt">,
            tenantId,
            groupSlug
          );
          sinCargoSubgroupId = Number(created.subgroupId ?? created.id);
        }
      }

      if (!sinCargoSubgroupId) {
        console.warn("No fue posible determinar/crear el subgrupo 'Sin cargo'. Abortando desasignación.");
        return;
      }

      // 2) Mover el miembro al subgrupo "Sin cargo" dentro de la misma sección
      const memberIdNum = Number(memberId);
      const memberIdToSend: number | string = Number.isFinite(memberIdNum) ? memberIdNum : memberId;

      const result = await dispatch(
        assignSubgroupAndSectionAction({
          memberId: memberIdToSend,
          subGroupId: sinCargoSubgroupId,
          sectionId: Number.isFinite(Number(nivel.id)) ? Number(nivel.id) : undefined,
        })
      );
      if (assignSubgroupAndSectionAction.fulfilled.match(result)) {
        setShowSuccess(true);
        // Refrescar lista de miembros (preferir enriquecido)
        const r1 = await dispatch(fetchMembersWithBranchAction());
        if (fetchMembersWithBranchAction.rejected.match(r1)) {
          await dispatch(fetchMembersAction());
        }
        setMembersRefreshKey((k) => k + 1);
      } else {
        console.error("Error al desasignar miembro del cargo: ", result);
      }
    } catch (e) {
      console.error("Fallo al desasignar miembro del cargo", e);
    }
  };

  // Helpers locales para advertencia al eliminar un nivel
  const toNumberSafe = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const getMemberSubgroupId = (m: Member): number | undefined => {
    return (
      toNumberSafe(m?.subgroup_id) ??
      toNumberSafe(m?.subgroup?.subgroupId) ??
      toNumberSafe(m?.subgroup?.subgroup_id)
    );
  };
  const getCargoName = (c: Cargo | { nombre?: string; name?: string }): string => {
    const maybe = (c as { nombre?: string; name?: string });
    return String(maybe.nombre ?? maybe.name ?? "");
  };

  const computeLevelCounts = (nivel: Nivel) => {
    // Ignorar el cargo especial "Sin cargo" para fines de eliminación de nivel
    const cargos = (nivel.cargos || []).filter((c) => !isSinCargoName(getCargoName(c as Cargo)));
    const cargoCount = cargos.length;
    let memberCount = 0;
    if (cargoCount > 0 && members && members.length > 0) {
      const cargoIds = cargos
        .map((c) => toNumberSafe((c as unknown as { id?: unknown }).id))
        .filter((id): id is number => typeof id === 'number');
      if (cargoIds.length > 0) {
        memberCount = members.reduce((acc, m) => {
          const sg = getMemberSubgroupId(m);
          return acc + (sg !== undefined && cargoIds.includes(sg) ? 1 : 0);
        }, 0);
      }
    }
    return { cargoCount, memberCount };
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "nivel") {
      // Evitar eliminar si viene bloqueado por asociaciones
      if ((deleteTarget.cargoCount || 0) + (deleteTarget.memberCount || 0) > 0) {
        return;
      }
      await removeNivel(deleteTarget.id);
    } else {
      // Eliminar cargo dentro del nivel
      // Evitar eliminar si el cargo tiene miembros asociados,
      // excepto cuando es el cargo especial "Sin cargo" (permitido).
      if (!deleteTarget.isSinCargo && (deleteTarget.memberCount || 0) > 0) {
        return;
      }
      const nivel = data.niveles.find(
        (n) => n.id === deleteTarget.nivelId
      );
      if (nivel) {
        await removeCargo(nivel.id, deleteTarget.id);
      }
    }

    setOpenDelete(false);
    setShowSuccess(true);
  };

  // Nota: la visibilidad del cargo ahora no se alterna desde aquí; el ícono de ojo abre el modal de información.

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      {/* CABECERA */}
      <header className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-extrabold text-primary">
          Gestión de Niveles Organizativos
        </h1>
        <p className="text-accent-foreground">
          Administra la estructura organizativa de tu grupo scout
        </p>
      </header>

      {/* CONTROLES SUPERIORES */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Button
          onClick={() => navigate("/app/organigrama")}
          variant="outline"
          className="border border-border bg-secondary text-white hover:opacity-90"
        >
          Anterior
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg px-4 py-2"
            onClick={() => setOpenCreateNivel(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Nivel
          </Button>
          <ExportMenu data={data} members={members} />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <Card className="p-6 text-center text-accent-foreground shadow-sm bg-card">
          Cargando…
        </Card>
      ) : (
        <div className="space-y-5">
          {/* ===== Sección: Acordeones de COMITÉ (ramas) ===== */}
          {comiteRamas && comiteRamas.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-3">Comités</h2>
              <RamaList
                ramas={comiteRamas}
                // Pasamos handlers: onCreateSubrama abre el modal Crear Cargo en este módulo
                onEditRama={() => { console.info('editar rama (desde niveles)'); }}
                onCreateSubrama={(ramaId) => handleCreateCargoFromRama(ramaId)}
                onEditSubrama={() => { console.info('editar subrama (desde niveles)'); }}
                onDeleteSubrama={() => { console.info('eliminar subrama (desde niveles)'); }}
              />
            </div>
          )}
          {/* Estado de carga/errores de miembros */}
          {membersLoading && (
            <Card className="p-3 text-sm text-accent-foreground bg-card border border-border">
              Cargando miembros desde el servidor…
            </Card>
          )}
          {membersError && (
            <Card className="p-3 text-sm text-destructive bg-card border border-border">
              {membersError}
            </Card>
          )}

          {data.niveles.length === 0 && (
            <Card className="p-6 text-accent-foreground text-center bg-card border border-border">
              Aún no hay niveles para {anio}. Crea el primero con el botón
              superior.
            </Card>
          )}

          {data.niveles.map((nivel) => (
            <LevelAccordion
              key={nivel.id}
              nivel={nivel}
              refreshKey={membersRefreshKey}
              onUpdate={(nivelEditado) => {
                setNivelToEdit(nivelEditado);
                setOpenEditNivel(true);
              }}
              onDelete={() => {
                const { cargoCount, memberCount } = computeLevelCounts(nivel);
                setDeleteTarget({
                  type: "nivel",
                  id: nivel.id,
                  name: nivel.nombre,
                  cargoCount,
                  memberCount,
                });
                setOpenDelete(true);
              }}
              onAddCargo={() => {
                setNivelActual(nivel);
                setOpenCreateCargo(true);
              }}
              onEditCargo={(cargo) => {
                setNivelActual(nivel);
                handleEditCargo(cargo);
              }}
              onAddMember={(cargo) => handleOpenAddMember(nivel, cargo)}
              onDeleteCargo={(cargo) => handleDeleteCargo(cargo, nivel)}
              onRemoveMember={(cargo, memberId) => handleRemoveMemberFromCargo(nivel, cargo, memberId)}
            />
          ))}
        </div>
      )}

      {/* MODALES */}

      {/* Crear Nivel */}
      <CreateNivelModal
        open={openCreateNivel}
        onClose={() => setOpenCreateNivel(false)}
        onSave={handleCreateNivel}
      />

      {/* Editar Nivel */}
      <EditNivelModal
        open={openEditNivel}
        nivel={nivelToEdit}
        onClose={() => setOpenEditNivel(false)}
        onSave={handleEditNivel}
      />

      {/* Crear Cargo */}
      <CreateCargoModal
        open={openCreateCargo}
        onClose={() => setOpenCreateCargo(false)}
        onSave={handleCreateCargo}
        initialNombre={initialCargoNombre}
      />

      {/* Editar Cargo */}
      <EditCargoModal
        open={openEditCargo}
        cargo={cargoToEdit}
        onClose={() => setOpenEditCargo(false)}
        onSave={handleSaveEditCargo}
      />

      {/* Agregar miembro al Cargo */}
      <AddMemberModal
        open={openAddMember}
        cargo={cargoToAssign}
        onClose={() => setOpenAddMember(false)}
        onAssign={handleAssignMemberToCargo}
        members={members}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDeleteModal
        open={openDelete}
        type={deleteTarget?.type || "nivel"}
        name={deleteTarget?.name || ""}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        warning={
          deleteTarget?.type === 'nivel' && (deleteTarget?.cargoCount || 0) + (deleteTarget?.memberCount || 0) > 0
            ? `No se puede eliminar este nivel porque tiene ${deleteTarget?.cargoCount ?? 0} cargo(s) y ${deleteTarget?.memberCount ?? 0} miembro(s) asociados.`
            : deleteTarget?.type === 'cargo' && !deleteTarget?.isSinCargo && (deleteTarget?.memberCount || 0) > 0
            ? `No se puede eliminar este cargo porque tiene ${deleteTarget?.memberCount ?? 0} miembro(s) asociados.`
            : undefined
        }
        disableConfirm={
          (deleteTarget?.type === 'nivel' && (deleteTarget?.cargoCount || 0) + (deleteTarget?.memberCount || 0) > 0) ||
          (deleteTarget?.type === 'cargo' && !deleteTarget?.isSinCargo && (deleteTarget?.memberCount || 0) > 0)
        }
      />

      {/* Modal de éxito */}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

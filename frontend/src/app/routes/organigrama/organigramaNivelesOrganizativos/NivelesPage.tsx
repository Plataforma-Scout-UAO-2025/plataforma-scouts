import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import ExportMenu from "./components/ExportMenu";
import LevelAccordion from "./components/LevelAccordion";
import { useNiveles } from "./hooks/useNiveles";
import { useNavigate } from "react-router-dom";
import { getMembers } from "@/api/membersApi";
// Importar submódulo de ramas/subramas para mostrar solo los acordeones de COMITÉ
import { useTenantParams } from "../organigramaRamas_Subramas/hooks/useTenantParams";
import useOrganigramaData from "../organigramaRamas_Subramas/hooks/useOrganigramaData";
import RamaList from "../organigramaRamas_Subramas/components/RamaList";

// 🔹 Modales importados
import CreateNivelModal from "./components/CreateNivelModal";
import EditNivelModal from "./components/EditNivelModal";
import CreateCargoModal from "./components/CreateCargoModal";
import EditCargoModal from "./components/EditCargoModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import SuccessModal from "./components/SuccessModal";

import type { Nivel, Cargo } from "./types/niveles.types";
import type { Member } from "@/types/member.type";

export default function NivelesPage() {
  const currentYear = new Date().getFullYear();
  const { anio, data, loading, addNivel, updateNivel, removeNivel } =
    useNiveles(currentYear);

  // ===== ESTADOS =====
  const [openCreateNivel, setOpenCreateNivel] = useState(false);
  const [openEditNivel, setOpenEditNivel] = useState(false);
  const [nivelToEdit, setNivelToEdit] = useState<Nivel | null>(null);

  const [openCreateCargo, setOpenCreateCargo] = useState(false);
  const [nivelActual, setNivelActual] = useState<Nivel | null>(null);
  const [initialCargoNombre, setInitialCargoNombre] = useState<string | undefined>(undefined);

  const [openEditCargo, setOpenEditCargo] = useState(false);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "nivel" | "cargo";
    id: string;
    name: string;
    nivelId?: string;
  } | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  // Hooks del submódulo de ramas: deben invocarse en el mismo orden siempre
  const { tenantId, groupSlug } = useTenantParams();
  const { ramas } = useOrganigramaData(tenantId, groupSlug);

  // Filtrar las ramas que sean comités (case-insensitive)
  const comiteRamas = (ramas ?? []).filter((r) => {
    const name = String(r.name || r.nombre || '').toLowerCase();
    return name.includes('comit');
  });

  // ===== MIEMBROS DESDE BACKEND =====
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setMembersLoading(true);
        const list = await getMembers();
        if (mounted) setMembers(list || []);
      } catch (e) {
        console.warn("No se pudieron cargar los miembros", e);
        if (mounted) setMembersError("No se pudieron cargar los miembros");
      } finally {
        if (mounted) setMembersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

    const nuevoCargo = {
      id: Date.now().toString(),
      nombre,
      titular,
      descripcion,
      visible: true,
    };

    const actualizado = {
      ...nivelActual,
      cargos: [...nivelActual.cargos, nuevoCargo],
    };

    updateNivel(actualizado);
    setOpenCreateCargo(false);
    setShowSuccess(true);
  };

  const handleEditCargo = (cargo: Cargo) => {
    setCargoToEdit(cargo);
    setOpenEditCargo(true);
  };

  const handleSaveEditCargo = (cargo: Cargo) => {
    if (!nivelActual) return;
    const actualizado = {
      ...nivelActual,
      cargos: nivelActual.cargos.map((c) =>
        c.id === cargo.id ? cargo : c
      ),
    };
    updateNivel(actualizado);
    setOpenEditCargo(false);
    setShowSuccess(true);
  };

  const handleDeleteCargo = (cargo: Cargo, nivel: Nivel) => {
    setDeleteTarget({
      type: "cargo",
      id: cargo.id,
      name: cargo.nombre,
      nivelId: nivel.id,
    });
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "nivel") {
      await removeNivel(deleteTarget.id);
    } else {
      // Eliminar cargo dentro del nivel
      const nivel = data.niveles.find(
        (n) => n.id === deleteTarget.nivelId
      );
      if (nivel) {
        const actualizado = {
          ...nivel,
          cargos: nivel.cargos.filter((c) => c.id !== deleteTarget.id),
        };
        updateNivel(actualizado);
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
          Niveles Organizativos
        </h1>
        <p className="text-accent-foreground">
          Administra la estructura organizativa del grupo scout
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
          <ExportMenu data={data} />
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
              onUpdate={(nivelEditado) => {
                setNivelToEdit(nivelEditado);
                setOpenEditNivel(true);
              }}
              onDelete={() => {
                setDeleteTarget({
                  type: "nivel",
                  id: nivel.id,
                  name: nivel.nombre,
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
              onDeleteCargo={(cargo) => handleDeleteCargo(cargo, nivel)}
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
        members={members}
      />

      {/* Editar Cargo */}
      <EditCargoModal
        open={openEditCargo}
        cargo={cargoToEdit}
        onClose={() => setOpenEditCargo(false)}
        onSave={handleSaveEditCargo}
        members={members}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDeleteModal
        open={openDelete}
        type={deleteTarget?.type || "nivel"}
        name={deleteTarget?.name || ""}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      {/* Modal de éxito */}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

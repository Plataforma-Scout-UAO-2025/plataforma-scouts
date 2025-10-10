import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import ExportMenu from "./components/ExportMenu";
import LevelAccordion from "./components/LevelAccordion";
import { useNiveles } from "./hooks/useNiveles";
import { useNavigate } from "react-router-dom";

// 🔹 Modales importados
import CreateNivelModal from "./components/CreateNivelModal";
import EditNivelModal from "./components/EditNivelModal";
import CreateCargoModal from "./components/CreateCargoModal";
import EditCargoModal from "./components/EditCargoModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import SuccessModal from "./components/SuccessModal";

import type { Nivel, Cargo } from "./types/niveles.types";

export default function NivelesPage() {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => [currentYear + 1, currentYear, currentYear - 1, 2025, 2024],
    [currentYear]
  );

  const { anio, setAnio, data, loading, addNivel, updateNivel, removeNivel } =
    useNiveles(currentYear);

  // ===== ESTADOS =====
  const [openCreateNivel, setOpenCreateNivel] = useState(false);
  const [openEditNivel, setOpenEditNivel] = useState(false);
  const [nivelToEdit, setNivelToEdit] = useState<Nivel | null>(null);

  const [openCreateCargo, setOpenCreateCargo] = useState(false);
  const [nivelActual, setNivelActual] = useState<Nivel | null>(null);

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

  const handleDeleteNivel = async () => {
    if (!deleteTarget) return;
    await removeNivel(deleteTarget.id);
    setOpenDelete(false);
    setShowSuccess(true);
  };

  // ===== HANDLERS DE CARGOS =====

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

  const handleToggleVisibleCargo = (cargo: Cargo, nivel: Nivel) => {
    const actualizado = {
      ...nivel,
      cargos: nivel.cargos.map((c) =>
        c.id === cargo.id ? { ...c, visible: !c.visible } : c
      ),
    };
    updateNivel(actualizado);
  };

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
        <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
          <SelectTrigger className="w-48 bg-white border-border text-foreground font-medium">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
              onToggleVisibleCargo={(cargo) =>
                handleToggleVisibleCargo(cargo, nivel)
              }
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
      />

      {/* Editar Cargo */}
      <EditCargoModal
        open={openEditCargo}
        cargo={cargoToEdit}
        onClose={() => setOpenEditCargo(false)}
        onSave={handleSaveEditCargo}
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

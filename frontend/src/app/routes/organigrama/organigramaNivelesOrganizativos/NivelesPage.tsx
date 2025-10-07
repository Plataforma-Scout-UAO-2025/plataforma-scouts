import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  const years = useMemo(() => [currentYear + 1, currentYear, currentYear - 1, 2025, 2024], [currentYear]);

  const { anio, setAnio, data, loading, addNivel, updateNivel, removeNivel, addCargo, updateCargo, removeCargo } =
    useNiveles(currentYear);

  // Estados de modales
  const [openCreateNivel, setOpenCreateNivel] = useState(false);
  const [openEditNivel, setOpenEditNivel] = useState(false);
  const [nivelToEdit, setNivelToEdit] = useState<Nivel | null>(null);

  const [openCreateCargo, setOpenCreateCargo] = useState(false);
  const [openEditCargo, setOpenEditCargo] = useState(false);
  const [cargoToEdit, setCargoToEdit] = useState<Cargo | null>(null);
  const [nivelTargetId, setNivelTargetId] = useState<string | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "nivel" | "cargo"; id: string; name: string; nivelId?: string } | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Handlers ------------------------

  const handleCreateNivel = (nombre: string, descripcion?: string) => {
    addNivel(nombre);
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

  const handleCreateCargo = (nombre: string, titular: string, descripcion?: string) => {
    if (!nivelTargetId) return;
    addCargo(nivelTargetId, nombre, titular);
    setOpenCreateCargo(false);
    setShowSuccess(true);
  };

  const handleEditCargo = (cargo: Cargo) => {
    if (!nivelTargetId) return;
    updateCargo(nivelTargetId, cargo);
    setOpenEditCargo(false);
    setShowSuccess(true);
  };

  const handleDeleteCargo = async () => {
    if (!deleteTarget || !deleteTarget.nivelId) return;
    await removeCargo(deleteTarget.nivelId, deleteTarget.id);
    setOpenDelete(false);
    setShowSuccess(true);
  };

  // Render ------------------------

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-emerald-900">Niveles Organizativos</h1>
      <p className="text-gray-600 mb-4">Administra la estructura organizativa del grupo scout.</p>

      {/* Header con selector de año y botones */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant="outline" onClick={() => navigate("/app/organigrama")} className="text-sm">Anterior</Button>
        <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
          <SelectTrigger className="w-44">
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

        <div className="ml-auto flex items-center gap-2">
          <Button
            className="bg-emerald-900 hover:bg-emerald-800"
            onClick={() => setOpenCreateNivel(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Crear Nuevo Nivel
          </Button>
          <ExportMenu data={data} />
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <Card className="p-6">Cargando…</Card>
      ) : (
        <div>
          {data.niveles.length === 0 && (
            <Card className="p-6 text-gray-600">
              Aún no hay niveles para {anio}. Crea el primero con el botón de arriba.
            </Card>
          )}

          {data.niveles.map((n) => (
            <LevelAccordion
              key={n.id}
              nivel={n}
              onUpdate={(nivel) => {
                setNivelToEdit(nivel);
                setOpenEditNivel(true);
              }}
              onDelete={() => {
                setDeleteTarget({ type: "nivel", id: n.id, name: n.nombre });
                setOpenDelete(true);
              }}
              onAddCargo={(nivelId) => {
                setNivelTargetId(nivelId);
                setOpenCreateCargo(true);
              }}
              onUpdateCargo={(nivelId, cargo) => {
                setNivelTargetId(nivelId);
                setCargoToEdit(cargo);
                setOpenEditCargo(true);
              }}
              onDeleteCargo={(nivelId, cargoId) => {
                const cargo = n.cargos.find((c) => c.id === cargoId);
                if (cargo) {
                  setDeleteTarget({ type: "cargo", id: cargoId, name: cargo.nombre, nivelId });
                  setOpenDelete(true);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Modales -------------------------- */}

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
        onSave={handleEditCargo}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDeleteModal
        open={openDelete}
        type={deleteTarget?.type || "nivel"}
        name={deleteTarget?.name || ""}
        onClose={() => setOpenDelete(false)}
        onConfirm={deleteTarget?.type === "nivel" ? handleDeleteNivel : handleDeleteCargo}
      />

      {/* Modal de éxito */}
      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

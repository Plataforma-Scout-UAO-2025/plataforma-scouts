import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, Pencil, ChevronDown } from "lucide-react";
import type { Nivel, Cargo } from "../types/niveles.types";
import PositionItem from "./PositionItem";

interface Props {
  nivel: Nivel;
  onUpdate: (nivel: Nivel) => void;
  onDelete: (id: string) => void;
  onAddCargo: (nivelId: string) => void;
  onEditCargo?: (cargo: Cargo) => void;
  onDeleteCargo?: (cargo: Cargo) => void;
  onToggleVisibleCargo?: (cargo: Cargo) => void;
  /** Opcional: iniciar abierto o cerrado (por defecto: true) */
  defaultOpen?: boolean;
}

export default function LevelAccordion({
  nivel,
  onUpdate,
  onDelete,
  onAddCargo,
  onEditCargo,
  onDeleteCargo,
  onToggleVisibleCargo,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  const toggle = () => setOpen((v) => !v);
  const onKeyToggle: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <Card
      className={`border border-border bg-card shadow-sm rounded-xl transition-all duration-200 ${
        open ? "pb-2" : "pb-0"
      }`}
    >
      {/* ===== HEADER DEL NIVEL ===== */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40 rounded-t-xl">
        {/* Título con toggle */}
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-controls={`nivel-panel-${nivel.id}`}
          onClick={toggle}
          onKeyDown={onKeyToggle}
        >
          <ChevronDown
            className={`h-5 w-5 text-primary transition-transform duration-200 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
            aria-hidden="true"
          />
          <div className="font-semibold text-primary text-lg">
            {nivel.nombre}
          </div>
        </div>

        {/* Botones de acción del nivel */}
        <div className="flex items-center gap-2">
          {/* Visibilidad */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md border border-border hover:bg-accent hover:text-primary transition-colors"
            onClick={() => onUpdate({ ...nivel, visible: !nivel.visible })}
            aria-label={nivel.visible ? "Ocultar nivel" : "Mostrar nivel"}
          >
            {nivel.visible ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <EyeOff className="h-4 w-4 text-accent-foreground" />
            )}
          </Button>

          {/* Editar */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md border border-border hover:bg-accent hover:text-primary transition-colors"
            onClick={() => onUpdate(nivel)}
            aria-label="Editar nivel"
          >
            <Pencil className="h-4 w-4 text-secondary" />
          </Button>

          {/* Eliminar */}
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 rounded-md border border-border bg-transparent hover:bg-destructive/10 transition-colors"
            onClick={() => onDelete(nivel.id)}
            aria-label="Eliminar nivel"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* ===== CONTENIDO COLAPSABLE ===== */}
      <div
        id={`nivel-panel-${nivel.id}`}
        className={`px-5 overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out ${
          open ? "grid grid-rows-[1fr] pt-3" : "grid grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0">
          <div className="space-y-2">
            {nivel.cargos.map((cargo) => (
              <PositionItem
                key={cargo.id}
                cargo={cargo}
                onEdit={() => onEditCargo?.(cargo)}
                onDelete={() => onDeleteCargo?.(cargo)}
                onToggleVisible={() => onToggleVisibleCargo?.(cargo)}
              />
            ))}
          </div>

          {/* Botón "Crear Nuevo Cargo" */}
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={() => onAddCargo(nivel.id)}
              className="w-full justify-center border border-border text-primary hover:bg-accent font-medium rounded-md"
            >
              + Crear Nuevo Cargo
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

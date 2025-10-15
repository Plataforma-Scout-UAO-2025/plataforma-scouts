import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, Pencil, ChevronDown } from "lucide-react";
import type { Nivel } from "../types/niveles.types";
import PositionItem from "./PositionItem";

interface Props {
  nivel: Nivel;
  onUpdate: (nivel: Nivel) => void;
  onDelete: (id: string) => void;
  /** Opcional: iniciar abierto o cerrado (por defecto: true) */
  defaultOpen?: boolean;
}

export default function LevelAccordion({
  nivel,
  onUpdate,
  onDelete,
  
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
    <Card className="mb-4 border-emerald-200">
      {/* Header del Nivel: toggle + acciones */}
      <div className="flex items-center justify-between px-4 py-3">
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
            className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
            aria-hidden="true"
          />
          <div className="font-semibold text-emerald-900 text-lg">{nivel.nombre}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onUpdate({ ...nivel, visible: !nivel.visible })}
            aria-label={nivel.visible ? "Ocultar nivel" : "Mostrar nivel"}
          >
            {nivel.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="secondary"
            onClick={() => onUpdate(nivel)}
            aria-label="Editar nivel"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(nivel.id)}
            aria-label="Eliminar nivel"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panel colapsable */}
      <div
        id={`nivel-panel-${nivel.id}`}
        className={`px-4 overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out ${
          open ? "grid grid-rows-[1fr] pb-4" : "grid grid-rows-[0fr] pb-0"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0">
          <div className="space-y-2">
            {nivel.cargos.map((cargo) => (
              <PositionItem key={cargo.id} cargo={cargo} />
            ))}
          </div>

          {/* Crear cargos removido por decisión de UI */}
        </div>
      </div>
    </Card>
  );
}

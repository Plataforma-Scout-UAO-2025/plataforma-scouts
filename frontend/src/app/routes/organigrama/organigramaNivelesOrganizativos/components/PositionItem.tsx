import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { Cargo } from "../types/niveles.types";

interface Props {
  cargo: Cargo;
  /** Alterna la visibilidad del cargo */
  onToggleVisible?: (cargo: Cargo) => void;
  /** Abre el modal de edición del cargo */
  onEdit?: (cargo: Cargo) => void;
  /** Confirma/elimina el cargo */
  onDelete?: (cargo: Cargo) => void;
}

export default function PositionItem({ cargo, onToggleVisible, onEdit, onDelete }: Props) {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-lg border border-border bg-card
        px-3 py-2
        hover:bg-muted/40 transition-colors
      "
    >
      {/* Info del cargo */}
      <div className="flex-1 mr-3">
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <div className="font-medium text-primary">{cargo.nombre}</div>

          {cargo.titular && (
            <div className="text-sm text-muted-foreground">• {cargo.titular}</div>
          )}

          {!cargo.visible && (
            <span
              className="
                mt-1 md:mt-0 inline-block
                text-[11px] leading-none
                px-2 py-1 rounded-md
                bg-accent text-accent-foreground
                border border-border
              "
            >
              Oculto
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Ver / Ocultar */}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-md border border-border hover:bg-accent hover:text-primary transition-colors"
          onClick={() => onToggleVisible?.(cargo)}
          aria-label={cargo.visible ? "Ocultar cargo" : "Mostrar cargo"}
        >
          {cargo.visible ? (
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
          onClick={() => onEdit?.(cargo)}
          aria-label="Editar cargo"
        >
          <Pencil className="h-4 w-4 text-secondary" />
        </Button>

        {/* Eliminar */}
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8 rounded-md border border-border bg-transparent hover:bg-destructive/10 transition-colors"
          onClick={() => onDelete?.(cargo)}
          aria-label="Eliminar cargo"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

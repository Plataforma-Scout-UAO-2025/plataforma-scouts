import { Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cargo } from "../types/niveles.types";

interface Props {
  cargo: Cargo;
  /** Abre el modal de edición del cargo (usa el cargo actual) */
  onEdit: () => void;
  /** Cambia visibilidad y persiste (lo maneja el padre) */
  onToggleVisible: () => void;
  /** Abre el modal de confirmación para eliminar */
  onDelete: () => void;
}

export default function PositionItem({ cargo, onEdit, onToggleVisible, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between border rounded-md p-2">
      {/* Info del cargo */}
      <div className="flex-1 mr-3">
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <div className="font-medium text-emerald-900">{cargo.nombre}</div>
          {cargo.titular && (
            <div className="text-sm text-gray-700">• {cargo.titular}</div>
          )}
          {!cargo.visible && (
            <span className="mt-1 md:mt-0 inline-block text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              Oculto
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <Button size="icon" variant="secondary" onClick={onEdit} aria-label="Editar cargo">
          <Pencil className="h-4 w-4" />
        </Button>

        <Button size="icon" variant="secondary" onClick={onToggleVisible} aria-label={cargo.visible ? "Ocultar cargo" : "Mostrar cargo"}>
          {cargo.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>

        <Button size="icon" variant="destructive" onClick={onDelete} aria-label="Eliminar cargo">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

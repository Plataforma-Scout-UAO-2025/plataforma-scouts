import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import CargoInfoModal from "./CargoInfoModal";
import type { Cargo } from "../types/niveles.types";


interface Props {
  cargo: Cargo;
  /** Lista de nombres de miembros asociados a este cargo */
  members?: string[];
  /** Abre el modal de edición del cargo */
  onEdit?: (cargo: Cargo) => void;
  /** Confirma/elimina el cargo */
  onDelete?: (cargo: Cargo) => void;
  /** Abre flujo para agregar miembro al cargo (misma lógica de editar) */
  onAddMember?: () => void;
}

export default function PositionItem({ cargo, members = [], onEdit, onDelete, onAddMember }: Props) {
  const [openInfo, setOpenInfo] = useState(false);

  // Simulación: nombre y descripción de la persona asignada (usar datos reales si están disponibles)
  const personName = cargo.titular || "Sin asignar";
  const personDescription = cargo.descripcion || "";

  return (
    <>
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
          {/* Se omite el nombre del cargo para no repetir el título del sub-acordeón */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            {cargo.titular && (
              <div className="text-sm text-muted-foreground">Titular: {cargo.titular}</div>
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

          {/* Miembros del cargo */}
          {members.length > 0 ? (
            <ul className="list-disc ml-5 mt-2 text-xs text-muted-foreground">
              {members.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          ) : (
            <div className="ml-1 mt-2 text-xs text-muted-foreground">— Sin miembros</div>
          )}

          {/* Botón para agregar miembro al cargo */}
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={onAddMember}
              className="w-full justify-center border border-border text-primary hover:bg-accent font-medium rounded-md"
            >
              + Agregar miembro al cargo
            </Button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Ver información del cargo (icono de ojo) */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md border border-border hover:bg-accent hover:text-primary transition-colors"
            onClick={() => setOpenInfo(true)}
            aria-label="Ver información del cargo"
          >
            <Eye className="h-4 w-4 text-primary" />
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

      {/* Modal de información del cargo */}
      <CargoInfoModal
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        cargoName={cargo.nombre}
        personName={personName}
        personDescription={personDescription}
        members={members}
      />
    </>
  );
}

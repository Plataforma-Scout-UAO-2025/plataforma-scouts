import type { Cargo } from "../types/niveles.types";

interface Props {
  cargo: Cargo;
}

export default function PositionItem({ cargo }: Props) {
  return (
    <div className="flex items-center justify-between border rounded-md p-2">
      {/* Info del cargo */}
      <div className="flex-1 mr-3">
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <div className="font-medium text-emerald-900">{cargo.nombre}</div>
          {cargo.titular && <div className="text-sm text-gray-700">• {cargo.titular}</div>}
          {!cargo.visible && (
            <span className="mt-1 md:mt-0 inline-block text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              Oculto
            </span>
          )}
        </div>
      </div>

      {/* Sin acciones sobre el miembro (solo mostrar) */}
      <div />
    </div>
  );
}

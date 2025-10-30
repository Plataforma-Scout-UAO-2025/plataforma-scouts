import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, Pencil, ChevronDown } from "lucide-react";
import type { Nivel, Cargo } from "../types/niveles.types";
import PositionItem from "./PositionItem";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembersAction } from "@/store/members/membersActions";
import type { RootState, AppDispatch } from "@/store/store";
import type { Member } from "@/types/member.type";

interface Props {
  nivel: Nivel;
  onUpdate: (nivel: Nivel) => void;
  onDelete: (id: string) => void;
  onAddCargo: (nivelId: string) => void;
  onEditCargo?: (cargo: Cargo) => void;
  onDeleteCargo?: (cargo: Cargo) => void;
  /** Abrir modal para agregar miembro a un cargo */
  onAddMember?: (cargo: Cargo) => void;
  /** Eliminar (desasignar) un miembro de un cargo */
  onRemoveMember?: (cargo: Cargo, memberId: string) => void;
  /** Opcional: iniciar abierto o cerrado (por defecto: true) */
  defaultOpen?: boolean;
  /** Forzar recarga de miembros listados por cargo cuando cambie */
  refreshKey?: number | string;
}

export default function LevelAccordion({
  nivel,
  onUpdate,
  onDelete,
  onAddCargo,
  onEditCargo,
  onDeleteCargo,
  onAddMember,
  onRemoveMember,
  defaultOpen = true,
  refreshKey,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { members } = useSelector((state: RootState) => state.members);
  
  const [open, setOpen] = useState<boolean>(defaultOpen);
  // Estado para sub-acordeones por rol: mapa roleName -> open
  const [groupsOpen, setGroupsOpen] = useState<Record<string, boolean>>({});
  // Miembros por cargo (subgroupId -> [{id, label}])
  const [membersByCargo, setMembersByCargo] = useState<Record<string, { id: string; label: string }[]>>({});

  // Agrupar cargos por rol (nombre del cargo). useMemo para rendimiento.
  const cargosPorRol = useMemo(() => {
    const map: Record<string, typeof nivel.cargos> = {};
    nivel.cargos.forEach((c) => {
      const key = c.nombre || "Sin rol";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [nivel]);

  // Normalizador para comparar cadenas sin tildes y minúsculas
  const normalize = (s: string) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Prioridades fijas por comité
  const jefaturaOrder = useMemo(
    () =>
      [
        "Jefe de Región",
        "Sub Jefe de Región",
        "Jefe de Grupo",
        "Sub Jefe de Grupo",
        "Jefe de Rama",
        "Sub Jefe de Subrama",
      ].map(normalize),
    []
  );

  const padresOrder = useMemo(
    () =>
      [
        "Presidente",
        "Vicepresidente",
        "Secretario",
        "Tesorero",
        "Vocal",
      ].map(normalize),
    []
  );

  // Determinar orden de grupos (roles) según el nombre del nivel (comité)
  const orderedRoleKeys = useMemo(() => {
    const keys = Object.keys(cargosPorRol);
    const nivelName = normalize(nivel.nombre);
    const isJefatura = nivelName.includes("comite de jefatura");
    const isPadres = nivelName.includes("comite de padres");
    if (!isJefatura && !isPadres) {
      // Por defecto, orden alfabético sensible al español
      return keys.sort((a, b) => a.localeCompare(b, "es"));
    }
    const priority = isJefatura ? jefaturaOrder : padresOrder;
    return keys.sort((a, b) => {
      const ai = priority.indexOf(normalize(a));
      const bi = priority.indexOf(normalize(b));
      const aIn = ai !== -1;
      const bIn = bi !== -1;
      if (aIn && bIn) return ai - bi;
      if (aIn) return -1;
      if (bIn) return 1;
      // Los no listados van después, en orden alfabético
      return a.localeCompare(b, "es");
    });
  }, [cargosPorRol, nivel.nombre, jefaturaOrder, padresOrder]);

  // Cargar miembros al montar el componente
  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchMembersAction());
    }
  }, [dispatch, members.length]);

  // Helper: convertir a número seguro
  const toNumberSafe = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // Helper: obtener subgroupId del miembro, soportando varias formas
  const getMemberSubgroupId = useCallback((m: Member): number | undefined => {
    return (
      // variante top-level
      toNumberSafe(m.subgroup_id) ??
      // variantes anidadas
      toNumberSafe(m.subgroup?.subgroupId) ??
      toNumberSafe(m.subgroup?.subgroup_id)
    );
  }, []);

  // Procesar miembros para cada cargo del nivel
  useEffect(() => {
    const cargos = nivel.cargos || [];
    if (cargos.length === 0) {
      setMembersByCargo({});
      return;
    }

  const map: Record<string, { id: string; label: string }[]> = {};
    
    cargos.forEach((cargo) => {
      const cargoIdNum = toNumberSafe(cargo.id);
      const assigned = members.filter((member: Member) => {
        const sgId = getMemberSubgroupId(member);
        return cargoIdNum !== undefined && sgId === cargoIdNum;
      });

      const detailed = assigned.map((member: Member) => {
        const id = String(member.memberId ?? member.member_id ?? "");
        const name = member.firstName || member.first_name || "";
        const last = member.lastName || member.last_name || "";
        const label = `${String(name).trim()} ${String(last).trim()}`.trim() || "Miembro";
        return { id, label };
      });

      map[String(cargo.id)] = detailed;
    });

    setMembersByCargo(map);
  }, [members, nivel.cargos, refreshKey, getMemberSubgroupId]);

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
      >
        <div className="min-h-0">
          <div className="space-y-3">
            {/* Renderizar sub-acordeones por rol */}
            {orderedRoleKeys.map((rol) => {
              const cargos = cargosPorRol[rol] || [];
              const isOpen = groupsOpen[rol] ?? true;
              return (
                <div key={rol} className="border border-border rounded-md bg-card">
                  <div
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none ${
                      isOpen ? "bg-muted/40" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setGroupsOpen((prev) => ({ ...prev, [rol]: !isOpen }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setGroupsOpen((prev) => ({ ...prev, [rol]: !isOpen }));
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`h-4 w-4 text-primary transition-transform duration-200 ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="font-medium text-primary">{rol}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cargos.reduce((acc, c) => acc + (membersByCargo[c.id]?.length || 0), 0)} miembro
                      {cargos.reduce((acc, c) => acc + (membersByCargo[c.id]?.length || 0), 0) === 1 ? "" : "s"}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      {cargos.map((cargo) => (
                        <PositionItem
                          key={cargo.id}
                          cargo={cargo}
                          membersDetailed={membersByCargo[cargo.id] || []}
                          onEdit={() => onEditCargo?.(cargo)}
                          onDelete={() => onDeleteCargo?.(cargo)}
                          // El botón interno "Agregar miembro al cargo" abre un modal propio
                          onAddMember={() => onAddMember?.(cargo)}
                          onRemoveMember={(memberId) => onRemoveMember?.(cargo, memberId)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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

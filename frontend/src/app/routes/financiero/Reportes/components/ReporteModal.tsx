import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Calendar,
} from "@/components/ui";
import { CalendarIcon, Download } from "lucide-react";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FiltrosReporte } from "@/types/reporte-financiero.type";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import type { Member as MemberType } from "@/types/member.type";
import type { Subgroup as SubgroupType } from "@/types/subgroup.type";
import type { Section as SectionType } from "@/types/section.type";

interface ReporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerarReporte: (filtros: FiltrosReporte) => void;
}

export default function ReporteModal({
  open,
  onOpenChange,
  onGenerarReporte,
}: ReporteModalProps) {
  const [scope, setScope] = useState<"SCOUT" | "SUBGROUP" | "SECTION">("SECTION");
  const [associatedTo, setAssociatedTo] = useState<{ id: string; name: string } | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  
  // Estados para los datos
  const [members, setMembers] = useState<MemberType[]>([]);
  const [subgroups, setSubgroups] = useState<SubgroupType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);

  const {tenantId} = useTenant();

  // Inicializar fechas por defecto cuando se abre el modal
  useEffect(() => {
    if (open) {
      const hoy = new Date();
      const haceUnMes = subMonths(hoy, 1);

      setFechaInicio(haceUnMes);
      setFechaFin(hoy);
    }

    // Cargar todos los datos necesarios
    async function fetchData() {
      try {
        // Cargar miembros
        const membersResponse = await api.get(`finanzas/fees/members/${tenantId}`);
        setMembers(membersResponse.data || []);
      } catch (error) {
        console.error("Error al cargar miembros:", error);
        toast.error("Error al cargar miembros del grupo");
      }

      try {
        // Cargar subgrupos
        const subgroupsResponse = await api.get(`finanzas/fees/subgroups/${tenantId}`);
        setSubgroups(subgroupsResponse.data || []);
      } catch (error) {
        console.error("Error al cargar subgrupos:", error);
        toast.error("Error al cargar subgrupos del grupo");
      }

      try {
        // Cargar secciones
        const sectionsResponse = await api.get(`finanzas/fees/sections/${tenantId}`);
        setSections(sectionsResponse.data || []);
      } catch (error) {
        console.error("Error al cargar secciones:", error);
        toast.error("Error al cargar secciones del grupo");
      }
    }

    fetchData();
  }, [open, tenantId]);

  const handleGenerarReporte = () => {
    if (!fechaInicio || !fechaFin) {
      return;
    }

    // Validar que se haya seleccionado un asociado
    if (!associatedTo) {
      toast.error("Debes seleccionar un asociado para este alcance");
      return;
    }

    const filtros: FiltrosReporte = {
      scope,
      associated_to: associatedTo || undefined,
      fechaInicio: format(fechaInicio, "yyyy-MM-dd"),
      fechaFin: format(fechaFin, "yyyy-MM-dd"),
    };

    onGenerarReporte(filtros);
    onOpenChange(false);
  };

  const resetForm = () => {
    setScope("SECTION");
    setAssociatedTo(null);
    // No resetear las fechas ya que se inicializan automáticamente cuando se abre el modal
  };

  const isFormValid = fechaInicio && fechaFin && (scope === "SECTION" || associatedTo !== null);

  // Función para manejar el cambio de scope
  const handleScopeChange = (value: "SCOUT" | "SUBGROUP" | "SECTION") => {
    setScope(value);
    setAssociatedTo(null); // Resetear el asociado cuando cambia el alcance
  };

  // Función para manejar el cambio del asociado
  const handleAssociatedToChange = (value: string) => {
    if (scope === "SCOUT") {
      const member = members.find(m => m.member_id.toString() === value);
      if (member) {
        setAssociatedTo({ id: member.member_id.toString(), name: `${member.first_name} ${member.last_name}` });
      }
    } else if (scope === "SUBGROUP") {
      const subgroup = subgroups.find(s => s.id.toString() === value);
      if (subgroup) {
        setAssociatedTo({ id: subgroup.id.toString(), name: subgroup.name });
      }
    } else if (scope === "SECTION") {
      const section = sections.find(s => s.id.toString() === value);
      if (section) {
        setAssociatedTo({ id: section.id.toString(), name: section.name });
      }
    }
  };

  const getPlaceholder = () => {
    switch (scope) {
      case "SCOUT": return "Selecciona un scout...";
      case "SUBGROUP": return "Selecciona un subgrupo...";
      case "SECTION": return "Selecciona una sección...";
      default: return "Selecciona un asociado...";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte de Pagos</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Selector de Alcance */}
          <div className="grid gap-2">
            <label htmlFor="alcance" className="text-sm font-medium">
              Alcance del Reporte
            </label>
            <Select
              value={scope}
              onValueChange={handleScopeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un alcance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCOUT">Scout específico</SelectItem>
                <SelectItem value="SUBGROUP">Subgrupo</SelectItem>
                <SelectItem value="SECTION">Sección</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selector condicional según el alcance */}
          <div className="grid gap-2">
            <label htmlFor="asociado" className="text-sm font-medium">
              Seleccionar {scope === "SCOUT" ? "Scout" : scope === "SUBGROUP" ? "Subgrupo" : "Sección"}
            </label>
            <Select
              value={associatedTo?.id || ""}
              onValueChange={handleAssociatedToChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={getPlaceholder()} />
              </SelectTrigger>
              <SelectContent>
                {scope === "SCOUT" && members.map((member) => (
                  <SelectItem
                    key={member.member_id}
                    value={member.member_id.toString()}
                  >
                    {member.member_id} - {member.first_name} {member.last_name}
                  </SelectItem>
                ))}
                {scope === "SUBGROUP" && subgroups.map((subgroup) => (
                  <SelectItem
                    key={subgroup.id}
                    value={subgroup.id.toString()}
                  >
                    {subgroup.id} - {subgroup.name}
                  </SelectItem>
                ))}
                {scope === "SECTION" && sections.map((section) => (
                  <SelectItem
                    key={section.id}
                    value={section.id.toString()}
                  >
                    {section.id} - {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de Inicio */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Fecha de Inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fechaInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaInicio
                    ? format(fechaInicio, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaInicio}
                  onSelect={setFechaInicio}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de Fin */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Fecha de Fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fechaFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaFin
                    ? format(fechaFin, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  locale={es}
                  disabled={(date) =>
                    fechaInicio ? date < fechaInicio : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerarReporte}
            disabled={!isFormValid}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Generar Reporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

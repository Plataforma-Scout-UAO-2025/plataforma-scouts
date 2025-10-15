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
import type { FiltrosReporte, Grupo } from "../types/reporte.type";
import type { ReportSection } from "@/types/reporte-financiero.type";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

interface ReporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerarReporte: (filtros: FiltrosReporte) => void;
}

// Datos mock de grupos
const GRUPOS_MOCK: Grupo[] = [
  {
    id: "1",
    nombre: "Manada Kuna",
    edadMinima: 7,
    edadMaxima: 11,
    miembrosActivos: 15,
  },
  {
    id: "2",
    nombre: "Tropa Paez",
    edadMinima: 11,
    edadMaxima: 15,
    miembrosActivos: 20,
  },
  {
    id: "3",
    nombre: "Clan Muisca",
    edadMinima: 15,
    edadMaxima: 18,
    miembrosActivos: 10,
  },
];

export default function ReporteModal({
  open,
  onOpenChange,
  onGenerarReporte,
}: ReporteModalProps) {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [sections, setSections] = useState<ReportSection[]>([]);

  const {tenantId} = useTenant();

  // Inicializar fechas por defecto cuando se abre el modal
  useEffect(() => {
    if (open) {
      const hoy = new Date();
      const haceUnMes = subMonths(hoy, 1);

      setFechaInicio(haceUnMes);
      setFechaFin(hoy);
    }

    async function getSections() {
      try {
        // Cargar secciones
        try {
          const sectionsResponse = await api.get(
            `finanzas/fees/sections/${tenantId}`
          );
          setSections(sectionsResponse.data || []);
        } catch (error) {
          console.error("Error al cargar secciones:", error);
          toast.error("Error al cargar secciones del grupo");
        }
      } catch (error) {}
    }

    getSections();
  }, [open]);

  const handleGenerarReporte = () => {
    if (!grupoSeleccionado || !fechaInicio || !fechaFin) {
      return;
    }

    const filtros: FiltrosReporte = {
      grupoId: grupoSeleccionado,
      fechaInicio: format(fechaInicio, "yyyy-MM-dd"),
      fechaFin: format(fechaFin, "yyyy-MM-dd"),
    };

    onGenerarReporte(filtros);
    onOpenChange(false);
  };

  const resetForm = () => {
    setGrupoSeleccionado("");
    // No resetear las fechas ya que se inicializan automáticamente cuando se abre el modal
  };

  const isFormValid = grupoSeleccionado && fechaInicio && fechaFin;

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
          {/* Selector de Grupo */}
          <div className="grid gap-2">
            <label htmlFor="grupo" className="text-sm font-medium">
              Grupo
            </label>
            <Select
              value={grupoSeleccionado}
              onValueChange={setGrupoSeleccionado}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
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

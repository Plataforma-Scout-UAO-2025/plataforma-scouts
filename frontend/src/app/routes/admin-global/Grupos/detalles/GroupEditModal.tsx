import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface GroupEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onSave?: (updated: Group) => void;
}

export default function GroupEditModal({
  open,
  onOpenChange,
  group,
  onSave,
}: GroupEditModalProps) {
  const [form, setForm] = useState<Partial<Group>>({});

  // Parse an ISO YYYY-MM-DD string into a local Date (avoids timezone/UTC shifts)
  const parseISOToLocalDate = (iso?: string | undefined): Date | undefined => {
    if (!iso) return undefined;
    const parts = String(iso).split("-").map((p) => Number(p));
    if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  useEffect(() => {
    if (group) {
      setForm({
        ...group,
      });
    } else {
      setForm({});
    }
  }, [group]);

  if (!group) return null;

  const updateField = <K extends keyof Group>(
    key: K,
    value: Group[K] | undefined
  ) => {
    setForm((prev) => ({ ...(prev as object), [key]: value }));
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (onSave && form) {
      onSave(form as Group);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Editar Grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="md:col-span-2 p-4 bg-white rounded-md border border-slate-200">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Información general
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-accent-foreground">
                    Nombre
                  </Label>
                  <Input
                    className="mt-1 w-full"
                    value={form.name ?? ""}
                    onChange={(e) =>
                      updateField("name" as keyof Group, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm text-accent-foreground">
                    Identificador (slug)
                  </Label>
                  <Input
                    className="mt-1 w-full"
                    value={form.slug ?? ""}
                    onChange={(e) =>
                      updateField("slug" as keyof Group, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm text-accent-foreground">
                    Correo electrónico
                  </Label>
                  <Input
                    type="email"
                    className="mt-1 w-full"
                    value={form.email ?? ""}
                    onChange={(e) =>
                      updateField("email" as keyof Group, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm text-accent-foreground">
                    Teléfono
                  </Label>
                  <Input
                    className="mt-1 w-full"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      updateField("phone" as keyof Group, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm text-accent-foreground">
                    Dirección
                  </Label>
                  <Input
                    className="mt-1 w-full"
                    value={form.address ?? ""}
                    onChange={(e) =>
                      updateField("address" as keyof Group, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm text-accent-foreground">
                    Fundado en
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "mt-1 w-full bg-white pl-3 text-left font-normal",
                          !form.foundedIn && "text-muted-foreground"
                        )}
                      >
                        {form.foundedIn ? (
                          (() => {
                            const dt = parseISOToLocalDate(String(form.foundedIn));
                            return dt ? format(dt, "PPP", { locale: es }) : <span>Selecciona una fecha</span>;
                          })()
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.foundedIn ? parseISOToLocalDate(String(form.foundedIn)) : undefined}
                        onSelect={(date) =>
                          updateField(
                            "foundedIn" as keyof Group,
                            date ? format(date, "yyyy-MM-dd") : undefined
                          )
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-full">
                    <label className="text-sm text-gray-500">Estado</label>
                    <div className="mt-2">
                      <Select
                        value={String(!!form.isActive)}
                        onValueChange={(val) =>
                          updateField("isActive" as keyof Group, val === "true")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Misión</h3>
              <Textarea
                className="mt-1 resize-none w-full"
                value={form.mission ?? ""}
                onChange={(e) =>
                  updateField("mission" as keyof Group, e.target.value)
                }
                rows={4}
              />
            </div>

            <div className="p-4 bg-white rounded-md border border-slate-200">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Visión</h3>
              <Textarea
                className="mt-1 resize-none w-full"
                value={form.vision ?? ""}
                onChange={(e) =>
                  updateField("vision" as keyof Group, e.target.value)
                }
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, BarChart3, CalendarDays } from "lucide-react";
import { useRoleContext } from "@/hooks/useRoleContext";

const ComiteAdminView = () => {
  const { currentUserRoleLabel } = useRoleContext();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          ¡Bienvenido, {currentUserRoleLabel || "Comité"}!
        </h1>
        <p className="text-muted-foreground mt-2">Herramientas y métricas para la gestión del comité</p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Resumen general
            </CardTitle>
            <CardDescription>
              Indicadores clave del grupo y actividad reciente (placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/40 border border-dashed border-border p-6 text-sm text-muted-foreground">
              Próximamente: KPIs de miembros, ramas, asistencia y pendientes del comité.
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5" />
              Acciones rápidas
            </CardTitle>
            <CardDescription>
              Atajos frecuentes del comité (placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Revisar solicitudes</li>
              <li>Ver reportes de ramas</li>
              <li className="flex items-center gap-1"><CalendarDays className="size-4" /> Consultar calendario</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComiteAdminView;

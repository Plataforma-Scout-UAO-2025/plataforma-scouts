import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { role } from "@/types/enrollment.type";

interface RoleSelectionFormProps {
  currentRole: role | undefined;
  onRoleChange: (newRole: role) => void;
  loading?: boolean;
}

const ROLES: { value: role; label: string; description: string }[] = [
  {
    value: "SCOUT",
    label: "Scout",
    description: "Miembro regular del grupo scout",
  },
  {
    value: "ACUDIENTE",
    label: "Acudiente",
    description: "Responsable legal de un scout",
  },
  {
    value: "SCOUTER",
    label: "Scouter",
    description: "Dirigente de rama o subrama",
  },
  {
    value: "TESORERO",
    label: "Tesorero",
    description: "Encargado de finanzas del grupo",
  },
  {
    value: "COMITE_ADMIN",
    label: "Comité Administrativo",
    description: "Miembro del comité administrativo",
  },
  {
    value: "ADMIN_GRUPO",
    label: "Administrador de Grupo",
    description: "Administrador con permisos completos del grupo",
  },
  {
    value: "ADMIN_GLOBAL",
    label: "Administrador Global",
    description: "Administrador con permisos globales del sistema",
  },
  {
    value: "DEV_SUPPORT",
    label: "Soporte Técnico",
    description: "Equipo de desarrollo y soporte",
  },
];

/**
 * Componente para seleccionar y cambiar el rol de un miembro.
 * Solo visible para ADMIN_GRUPO.
 * Incluye confirmación al cambiar roles críticos.
 */
export default function RoleSelectionForm({
  currentRole,
  onRoleChange,
  loading = false,
}: RoleSelectionFormProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState<role | null>(null);

  const handleRoleSelect = (newRole: string) => {
    const selectedRole = newRole as role;
    
    // Si es el mismo rol, no hacer nada
    if (selectedRole === currentRole) {
      return;
    }

    // Roles que requieren confirmación (administrativos)
    const criticalRoles: role[] = [
      "ADMIN_GRUPO",
      "ADMIN_GLOBAL",
      "TESORERO",
      "DEV_SUPPORT",
    ];

    if (criticalRoles.includes(selectedRole)) {
      setPendingRole(selectedRole);
      setShowConfirmDialog(true);
    } else {
      onRoleChange(selectedRole);
    }
  };

  const handleConfirmRoleChange = () => {
    if (pendingRole) {
      onRoleChange(pendingRole);
      setPendingRole(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelRoleChange = () => {
    setPendingRole(null);
    setShowConfirmDialog(false);
  };

  const getRoleLabel = (roleValue: role | undefined) => {
    if (!roleValue) return "Seleccionar rol";
    return ROLES.find((r) => r.value === roleValue)?.label || roleValue;
  };

  const getPendingRoleInfo = () => {
    return ROLES.find((r) => r.value === pendingRole);
  };

  return (
    <>
      <div className="space-y-4 p-6 border border-amber-200 rounded-lg bg-amber-50/50">
        <div className="flex items-center gap-2 text-amber-800">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Cambio de Rol</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Rol del Miembro
          </Label>
          <Select
            value={currentRole}
            onValueChange={handleRoleSelect}
            disabled={loading}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Seleccionar rol">
                {getRoleLabel(currentRole)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentRole && (
            <p className="text-xs text-muted-foreground mt-1">
              Rol actual: <span className="font-medium">{getRoleLabel(currentRole)}</span>
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-100 border border-amber-300 rounded-md">
          <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Importante:</strong> Cambiar el rol afectará los permisos y
            accesos del miembro en el sistema. Esta acción es irreversible y
            puede requerir que el usuario vuelva a iniciar sesión.
          </p>
        </div>
      </div>

      {/* Modal de Confirmación para Roles Críticos */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle>Confirmar Cambio de Rol</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Estás a punto de cambiar el rol a{" "}
              <strong className="text-foreground">
                {getPendingRoleInfo()?.label}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 px-6">
            <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3">
              {getPendingRoleInfo()?.description}
            </div>
            <div className="font-medium text-amber-800 text-sm">
              Este rol tiene permisos administrativos y puede acceder a
              funciones críticas del sistema.
            </div>
            <div className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas realizar este cambio?
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRoleChange}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRoleChange}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Sí, Cambiar Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

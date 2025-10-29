import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroupResponseDTO as Group } from "@/types/group.type";

interface GroupInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

export default function GroupInfoModal({
  open,
  onOpenChange,
  group,
}: GroupInfoModalProps) {
  // Early return después de todos los hooks
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Información del Grupo
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
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="text-base font-semibold text-gray-900">
                    {group.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Identificador</p>
                  <p className="text-base font-semibold text-gray-900">
                    {group.slug}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="text-base text-gray-700">
                    {group.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-base text-gray-700">
                    {group.phone || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="text-base text-gray-700">
                    {group.address || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fundado en</p>
                  <p className="text-base text-gray-700">
                    {group.foundedIn || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      group.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {group.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-md border border-slate-200">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Misión</h3>
              <p className="text-sm text-gray-700">{group.mission || "N/A"}</p>
            </div>

            <div className="p-4 bg-white rounded-md border border-slate-200">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Visión</h3>
              <p className="text-sm text-gray-700">{group.vision || "N/A"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

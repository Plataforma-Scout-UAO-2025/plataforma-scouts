import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Hash, 
  Building, 
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Youtube
} from "lucide-react";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import { getGroupStatusText, getGroupStatusClasses } from "@/utils/groupStatus";

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

  // Función para obtener el icono de red social
  const getSocialIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (lowerPlatform.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) return <Twitter className="w-4 h-4" />;
    if (lowerPlatform.includes('youtube')) return <Youtube className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  // Acceso híbrido a los datos para compatibilidad con backend
  const groupData = group as any;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Building className="w-6 h-6" />
            Información Completa del Grupo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Nombre del Grupo</p>
                <p className="text-lg font-semibold text-gray-900">{group.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">ID del Grupo</p>
                <p className="text-base text-gray-700">{group.groupId || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Slug/Identificador</p>
                <p className="text-base text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">{group.slug}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Distrito
                </p>
                <p className="text-base text-gray-700">{group.district || "No especificado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Número de Identificación</p>
                <p className="text-base text-gray-700">{group.identifierNumber || groupData.identifier_number || "No especificado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fundado en
                </p>
                <p className="text-base text-gray-700">{group.foundedIn || groupData.founded_in || "No especificado"}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Estado</p>
              <Badge className={`${getGroupStatusClasses(group)} px-3 py-1`}>
                {getGroupStatusText(group)}
              </Badge>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </p>
                <p className="text-base text-gray-700">{group.email || "No especificado"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </p>
                <p className="text-base text-gray-700">{group.phone || "No especificado"}</p>
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Dirección
                </p>
                <p className="text-base text-gray-700">{group.address || "No especificada"}</p>
              </div>
            </div>
          </div>

          {/* Filosofía del Grupo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Lema</h3>
              <p className="text-sm text-gray-700 italic">
                {group.motto || "No especificado"}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Misión</h3>
              <p className="text-sm text-gray-700">
                {group.mission || "No especificada"}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Visión</h3>
              <p className="text-sm text-gray-700">
                {group.vision || "No especificada"}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Historia</h3>
              <p className="text-sm text-gray-700">
                {group.history || "No especificada"}
              </p>
            </div>
          </div>

          {/* Redes Sociales */}
          {(group.socialLinks || groupData.social_links) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Redes Sociales</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(group.socialLinks || groupData.social_links || {}).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={String(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                  >
                    {getSocialIcon(platform)}
                    <span className="text-sm font-medium capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Información Técnica */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Técnica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Tenant ID</p>
                <p className="text-gray-700 font-mono bg-white px-2 py-1 rounded">{groupData.tenant_id || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Logo Object ID</p>
                <p className="text-gray-700 font-mono bg-white px-2 py-1 rounded">{group.logoObjectId || groupData.logo_object_id || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Scarf Object ID</p>
                <p className="text-gray-700 font-mono bg-white px-2 py-1 rounded">{group.scarfObjectId || groupData.scarf_object_id || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Estado del Sistema</p>
                <p className="text-gray-700">{group.status || "N/A"}</p>
              </div>
              
              {group.createdAt && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-600">Fecha de Creación</p>
                  <p className="text-gray-700">{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              
              {group.updatedAt && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-600">Última Actualización</p>
                  <p className="text-gray-700">{new Date(group.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginButton from "@/components/auth/LoginButton"
import RegisterButton from "../auth/RegisterButton"
import type { GroupResponseDTO } from "@/types/group.type"
import { FaFacebook, FaGlobe, FaInstagram, FaTwitter, FaYoutube, FaExternalLinkAlt} from "react-icons/fa"
import { Calendar, Mail, MapPin, Phone } from "lucide-react"
import { memo, useMemo, useState } from "react"

interface ScoutGroupCardProps {
  group: GroupResponseDTO
}

const getSocialIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'instagram':
      return <FaInstagram className="w-4 h-4" />;
    case 'facebook':
      return <FaFacebook className="w-4 h-4" />;
    case 'twitter':
    case 'x':
      return <FaTwitter className="w-4 h-4" />;
    case 'youtube':
      return <FaYoutube className="w-4 h-4" />;
    case 'website':
    case 'web':
      return <FaGlobe className="w-4 h-4" />;
    default:
      return <FaExternalLinkAlt className="w-4 h-4" />;
  }
};

export const ScoutGroupCard = memo(function ScoutGroupCard({ group }: ScoutGroupCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Memoizar datos computados
  const groupData = useMemo(() => {
    // Acceso compatible con backend (snake_case y camelCase)
    const backendData = group as GroupResponseDTO & {
      group_id?: number;
      social_links?: Record<string, unknown>;
      logo_object_url?: string;
      founded_in?: string;
    };
    
    return {
      groupId: backendData.group_id || group.groupId || group.slug || "unknown",
      name: group.name || `Grupo ${backendData.group_id || group.groupId || group.slug || "unknown"}`,
      description: group.mission || group.vision || group.history || "",
      socialLinks: backendData.social_links || group.socialLinks,
      logoUrl: backendData.logo_object_url || group.logoObjectId || "/Kids.png",
      foundedDate: backendData.founded_in || group.foundedIn
    };
  }, [group]);

  // Memoizar fecha formateada
  const formattedFoundedDate = useMemo(() => {
    if (!groupData.foundedDate) return null;
    try {
      return new Date(groupData.foundedDate).toLocaleDateString();
    } catch {
      return groupData.foundedDate;
    }
  }, [groupData.foundedDate]);

  // Memoizar redes sociales
  const socialLinksEntries = useMemo(() => {
    if (!groupData.socialLinks || typeof groupData.socialLinks !== 'object') return [];
    return Object.entries(groupData.socialLinks).filter(([, url]) => {
      return typeof url === 'string' && url.trim() !== '';
    });
  }, [groupData.socialLinks]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={groupData.logoUrl}
            alt={groupData.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'hover:scale-105 opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500 text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl text-balance">{groupData.name}</CardTitle>
        {group.motto && (
          <CardDescription className="text-sm italic text-primary">"{group.motto}"</CardDescription>
        )}
        {groupData.description && (
          <CardDescription className="text-pretty">{groupData.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {group.district && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{group.district}</span>
          </div>
        )}
        
        {group.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{group.address}</span>
          </div>
        )}
        
        {group.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{group.phone}</span>
          </div>
        )}
        
        {group.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{group.email}</span>
          </div>
        )}
        
        {formattedFoundedDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Fundado: {formattedFoundedDate}</span>
          </div>
        )}
        
        {socialLinksEntries.length > 0 && (
          <div className="pt-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">Redes sociales:</div>
            <div className="flex flex-wrap gap-2">
              {socialLinksEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={String(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  title={`${platform}: ${url}`}
                >
                  {getSocialIcon(platform)}
                  <span className="capitalize truncate max-w-20">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <LoginButton 
          organization={group.tenant_id}
          className="flex-1"
          variant="secondary"
        >
          Iniciar Sesión
        </LoginButton>

        <RegisterButton className="flex-1" 
          organization={group.tenant_id}>
          Registrarse
        </RegisterButton>
      </CardFooter>
    </Card>
  )
})
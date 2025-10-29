import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginButton from "@/components/auth/LoginButton"
import RegisterButton from "../auth/RegisterButton"
import type { GroupResponseDTO } from "@/types/group.type"
import { FaFacebook, FaGlobe, FaInstagram, FaTwitter, FaYoutube, FaExternalLinkAlt} from "react-icons/fa"
import { Calendar, Mail, MapPin, Phone } from "lucide-react"

interface ScoutGroupCardProps {
  group: GroupResponseDTO
}

const getSocialIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  console.log(`Getting icon for platform: ${platformLower}`);
  
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

export function ScoutGroupCard({ group }: ScoutGroupCardProps) {
  console.log("Rendering ScoutGroupCard for group:", group);
  
  const groupData = group as any;
  const groupId = groupData.group_id || group.groupId || group.slug || "unknown";
  const name = group.name || `Grupo ${groupId}`;
  const description = group.mission || group.vision || group.history || "";
  
  const socialLinks = groupData.social_links || group.socialLinks;
  
  console.log("Social links found:", socialLinks);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      
        <div className="aspect-video overflow-hidden">
          <img
            src={groupData.logo_object_url || group.logoObjectId || "/Kids.png"}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

      <CardHeader>
        <CardTitle className="text-xl text-balance">{name}</CardTitle>
        {group.motto && (
          <CardDescription className="text-sm italic text-primary">"{group.motto}"</CardDescription>
        )}
        {description && (
          <CardDescription className="text-pretty">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        
        {group.district && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{group.district}</span>
          </div>
        )}
        
        {group.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{group.address}</span>
          </div>
        )}
        
        {group.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{group.phone}</span>
          </div>
        )}
        
        {group.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{group.email}</span>
          </div>
        )}
        
        {(groupData.founded_in || group.foundedIn) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Fundado: {new Date(groupData.founded_in || group.foundedIn).toLocaleDateString()}</span>
          </div>
        )}
        
        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="pt-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">Redes sociales:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(socialLinks).map(([platform, url]) => (
                console.log(`Rendering social link for platform: ${platform}, url: ${url}`),
                <a
                  key={platform}
                  href={String(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  title={`${platform}: ${url}`}
                >
                  {getSocialIcon(platform)}
                  <span className="capitalize">{platform}</span>
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
}
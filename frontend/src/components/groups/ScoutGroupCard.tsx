import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginButton from "@/components/auth/LoginButton"
import RegisterButton from "../auth/RegisterButton"
import type { GroupResponseDTO } from "@/types/group.type"

interface ScoutGroupCardProps {
  group: GroupResponseDTO
}

export function ScoutGroupCard({ group }: ScoutGroupCardProps) {
  const defaultImage = "/Kids.png";
  const groupId = group.groupId || group.slug || "unknown";
  const name = group.name || `Grupo ${groupId}`;
  const description = group.mission || group.vision || group.history || "";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img
          src={defaultImage}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl text-balance">{name}</CardTitle>
        {description && (
          <CardDescription className="text-pretty">{description}</CardDescription>
        )}
      </CardHeader>

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
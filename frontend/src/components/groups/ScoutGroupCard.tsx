import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users } from "lucide-react"
import LoginButton from "@/components/auth/LoginButton"
import RegisterButton from "../auth/RegisterButton"

interface ScoutGroup {
  id: string
  name: string
  description: string
  location: string
  members: number
  image: string
  org_id: string
}

interface ScoutGroupCardProps {
  group: ScoutGroup
}

export function ScoutGroupCard({ group }: ScoutGroupCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img
          src={group.image}
          alt={group.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-xl text-balance">{group.name}</CardTitle>
        <CardDescription className="text-pretty">{group.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{group.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{group.members} miembros</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <LoginButton 
          organization={group.org_id}
          className="flex-1"
          variant="secondary"
        >
          Iniciar Sesión
        </LoginButton>

        <RegisterButton className="flex-1" 
          organization={group.org_id}>
          Registrarse
        </RegisterButton>
      </CardFooter>
    </Card>
  )
}
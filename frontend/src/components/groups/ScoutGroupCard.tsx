import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginButton from "@/components/auth/LoginButton"
import RegisterButton from "../auth/RegisterButton"
import type { Tenant } from "@/api/tenantsApi"

interface ScoutGroupCardProps {
  tenant: Tenant
}

export function ScoutGroupCard({ tenant }: ScoutGroupCardProps) {
  const defaultImage = "/Kids.png";
  const tenantId = tenant.tenant_id || tenant.id || tenant.slug || "unknown";
  const name = tenant.name || tenant.slug || `Grupo ${tenantId}`;
  const description = tenant.description || "";

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
          organization={tenantId}
          className="flex-1"
          variant="secondary"
        >
          Iniciar Sesión
        </LoginButton>

        <RegisterButton className="flex-1" 
          organization={tenantId}>
          Registrarse
        </RegisterButton>
      </CardFooter>
    </Card>
  )
}
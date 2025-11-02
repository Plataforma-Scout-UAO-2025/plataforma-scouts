import { useAuth0 } from "@auth0/auth0-react"
import { Button, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"

interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  organization: string
  asChild?: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({
  children = "Iniciar Sesión",
  organization,
  ...props
}) => {
  const { loginWithRedirect } = useAuth0()

  const handleClick = () => {
    loginWithRedirect({
      authorizationParams: {
        organization,
      },
    })
  }

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

export default LoginButton
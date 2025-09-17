import { useState, useEffect } from "react";
import { Mail, KeyRoundIcon, User, Eye, EyeOff } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth0 } from "@auth0/auth0-react";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register, handleSubmit } = useForm<RegisterFormValues>();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    // Método de registro tradicional (opcional)
    console.log(data);
  };

  const handleAuth0Register = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-primary/100 to-primary-hover/100 p-4">
      <div className="flex bg-background shadow-green-950 shadow-2xl overflow-hidden w-full max-w-5xl rounded-[12px]">
        <div className="w-2/3 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">
            Registro
          </h1>

          {/* Auth0 Register Button */}
          <div className="mb-6 px-8">
            <Button
              onClick={handleAuth0Register}
              className="w-full"
              type="button"
            >
              Registrarse con Auth0
            </Button>
            
            <div className="flex items-center my-4">
              <hr className="flex-1 border-accent-strong" />
              <span className="px-4 text-accent-strong text-sm">o</span>
              <hr className="flex-1 border-accent-strong" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 pr-8 pl-8"
          >
            {/* Name */}
            <div>
              <div className="flex mb-2">
                <User className="h-5 w-5 text-accent-strong mr-2" />
                <Label className="block text-sm font-medium text-primary mb-2">
                  Nombre completo
                </Label>
              </div>
              <Input
                type="text"
                placeholder="Juan Pérez"
                className="w-full outline-none bg-transparent text-foreground placeholder:text-accent-strong"
                required
                {...register("name", {
                  required: "Por favor, ingresa tu nombre completo.",
                })}
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex mb-2">
                <Mail className="h-5 w-5 text-accent-strong mr-2" />
                <Label className="block text-sm font-medium text-primary mb-2">
                  Correo electrónico
                </Label>
              </div>
              <Input
                type="email"
                placeholder="ejemplo@email.com"
                className="w-full outline-none bg-transparent text-foreground placeholder:text-accent-strong"
                required
                {...register("email", {
                  required: "Por favor, ingresa tu correo electrónico.",
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: "Por favor, ingresa un correo electrónico válido.",
                  },
                })}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex mb-2">
                <KeyRoundIcon className="h-5 w-5 text-accent-strong mr-2" />
                <Label className="block text-sm font-medium text-primary mb-2">
                  Contraseña
                </Label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="●●●●●●●●●●"
                  className="w-full outline-none bg-transparent text-foreground pr-10"
                  required
                  {...register("password", {
                    required: "Por favor, ingresa una contraseña.",
                    minLength: {
                      value: 8,
                      message:
                        "La contraseña debe tener al menos 8 caracteres.",
                    },
                  })}
                />
                <Button
                  variant="eyebutton"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex mb-2">
                <KeyRoundIcon className="h-5 w-5 text-accent-strong mr-2" />
                <Label className="block text-sm font-medium text-primary mb-2">
                  Confirmar contraseña
                </Label>
              </div>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="●●●●●●●●●●"
                  className="w-full outline-none bg-transparent text-foreground pr-10"
                  required
                  {...register("confirmPassword", {
                    required: "Por favor, confirma tu contraseña.",
                    validate: (value, formValues) =>
                      value === formValues.password || "Las contraseñas no coinciden.",
                  })}
                />
                <Button
                  variant="eyebutton"
                  onClick={() => setShowConfirm(!showConfirm)}
                  type="button"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="primary"
                className="w-2/5 rounded-sm"
                type="submit"
              >
                Registrarme
              </Button>
              <Button
                variant="secondary"
                className="w-2/5"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </Button>
            </div>
          </form>
        </div>

        {/* ---- DERECHA: ILUSTRACIÓN ---- */}
        <div className="w-2/3 bg-accent-soft flex items-center justify-center">
          <img
            src="src/assets/Illustration.png"
            alt="Ilustración registro"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;

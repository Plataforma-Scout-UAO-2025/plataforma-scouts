import { useState } from "react";
import { Mail, KeyRoundIcon, Eye, EyeOff } from "lucide-react";
import { Button, Input, Label, Checkbox } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    // Método de inicio de sesión
    console.log(data);
  };
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-primary/100 to-primary-hover/100 p-4">
      <div className="flex bg-background shadow-green-950 shadow-2xl overflow-hidden w-full max-w-5xl rounded-[12px]">
        {/* ---- IZQUIERDA: FORM ---- */}
        <div className="w-2/3 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">
            Inicio de sesión
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 p-8 pt-1"
          >
            {/* Email */}
            <div>
              <div className="flex mb-2">
                <Mail className="h-5 w-5 text-accent-strong mr-2" />
                <Label className="block text-sm font-medium text-primary mb-2">
                  Correo electrónico
                </Label>
              </div>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="ejemplo@email.com"
                  className="w-full outline-none bg-transparent text-foreground placeholder:text-accent-strong"
                  required
                  {...register("email", {
                    required: "Por favor, ingresa un correo válido.",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message:
                        "Por favor, ingresa un correo electrónico válido.",
                    },
                  })}
                />
              </div>
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
                      value: 6,
                      message:
                        "La contraseña debe tener al menos 6 caracteres.",
                    },
                  })}
                />
                <Button
                  variant="iconbutton"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="text-primary flex items-center justify-between text-sm">
              <Label className="flex items-center gap-2">
                <Checkbox />
                <span className="text-primary">Recordarme</span>
              </Label>
              <a
                href="#"
                className="text-primary hover:text-primary-hover hover:underline"
              >
                Olvidaste tu contraseña?
              </a>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="primary"
                className="w-2/5 rounded-sm"
                type="submit"
              >
                Iniciar sesión
              </Button>
              <Button
                variant="secondary"
                className="w-2/5"
                type="button"
                onClick={() => navigate("/register")}
              >
                Registrarse
              </Button>
            </div>
          </form>
        </div>

        {/* ---- DERECHA: ILUSTRACIÓN ---- */}
        <div className="w-2/3 bg-accent-soft flex items-center justify-center">
          <img
            src="src/assets/Illustration.png"
            alt="Ilustración login"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

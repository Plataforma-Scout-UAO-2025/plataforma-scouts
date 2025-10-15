import { Progress } from '@/components/ui/progress';

interface Props {
  percent: number;
  className?: string;
}

// Componente ligero de progreso para el módulo organigrama.
// No modifica el componente compartido `Progress` — realiza configuraicones locales
// (colores, texto) dentro del propio módulo para permitir reuso por otros equipos.
export default function OrganigramaProgress({ percent, className }: Props) {
  return (
    <div className={`w-full max-w-full ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Subiendo imagen</span>
        <span className="text-sm font-medium text-primary">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 bg-[#E6F3EE]" />
    </div>
  );
}

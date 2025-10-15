import { Progress } from '@/components/ui/progress';

interface Props {
  percent: number;
  className?: string;
}


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
import type { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MemberFormData } from '../../schemas/MemberForm.schema';

interface HealthInfoFormProps {
  register: UseFormRegister<MemberFormData>;
}

export default function HealthInfoForm({ register }: HealthInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1a4134]">Información de Salud</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Peso */}
        <div>
          <Label htmlFor="weight">Peso</Label>
          <Input
            id="weight"
            {...register('weight')}
            placeholder="Ej: 45 kg"
          />
        </div>

        {/* Altura */}
        <div>
          <Label htmlFor="height">Altura</Label>
          <Input
            id="height"
            {...register('height')}
            placeholder="Ej: 1.55 m"
          />
        </div>

        {/* Hobbies */}
        <div className="col-span-2">
          <Label htmlFor="hobbies">Hobbies e Intereses</Label>
          <Textarea
            id="hobbies"
            {...register('hobbies')}
            placeholder="Ej: Dibujar, Leer, Tocar Guitarra"
            rows={3}
          />
        </div>

        {/* Deportes */}
        <div className="col-span-2">
          <Label htmlFor="sports">Deportes que Practica</Label>
          <Textarea
            id="sports"
            {...register('sports')}
            placeholder="Ej: Fútbol, Natación"
            rows={2}
          />
        </div>

        {/* Instrumentos */}
        <div className="col-span-2">
          <Label htmlFor="instruments">Instrumentos Musicales</Label>
          <Textarea
            id="instruments"
            {...register('instruments')}
            placeholder="Ej: Guitarra, Piano"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

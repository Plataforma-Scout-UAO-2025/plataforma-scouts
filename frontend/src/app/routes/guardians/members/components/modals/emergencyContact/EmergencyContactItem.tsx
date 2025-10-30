import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface EmergencyContactItemProps {
  contact: EmergencyContact;
  index: number;
  canRemove: boolean;
  onUpdate: (index: number, field: keyof EmergencyContact, value: string) => void;
  onRemove: (index: number) => void;
}

export default function EmergencyContactItem({
  contact,
  index,
  canRemove,
  onUpdate,
  onRemove
}: EmergencyContactItemProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg border">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm text-gray-700">Contacto {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Nombre - Ocupa toda la fila */}
        <div className="space-y-2">
          <Label htmlFor={`emergency-name-${index}`} className="text-sm font-medium">
            Nombre Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`emergency-name-${index}`}
            type="text"
            placeholder="Nombre completo del contacto"
            value={contact?.name || ''}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
          />
        </div>

        {/* Parentesco y Teléfono - Lado a lado en pantallas grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`emergency-relationship-${index}`} className="text-sm font-medium">
              Parentesco <span className="text-red-500">*</span>
            </Label>
            <Select
              value={contact?.relationship || ''}
              onValueChange={(value) => onUpdate(index, 'relationship', value)}
            >
              <SelectTrigger id={`emergency-relationship-${index}`} className="bg-white">
                <SelectValue placeholder="Seleccione parentesco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Padre">Padre</SelectItem>
                <SelectItem value="Madre">Madre</SelectItem>
                <SelectItem value="Tutor">Tutor</SelectItem>
                <SelectItem value="Abuelo/a">Abuelo/a</SelectItem>
                <SelectItem value="Tío/a">Tío/a</SelectItem>
                <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`emergency-phone-${index}`} className="text-sm font-medium">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`emergency-phone-${index}`}
              type="tel"
              placeholder="+573001234567"
              value={contact?.phone || ''}
              onChange={(e) => onUpdate(index, 'phone', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
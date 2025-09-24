import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateRamaFormData } from '../schemas/rama.schema';

interface CreateRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRamaFormData) => Promise<void>;
}

export default function CreateRamaModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRamaFormData>({
    nombre: '',
    descripcion: '',
    edadMinima: 7,
    edadMaxima: 10,
    año: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
        edadMinima: 7,
        edadMaxima: 10,
        año: new Date().getFullYear(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear rama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        edadMinima: 7,
        edadMaxima: 10,
        año: new Date().getFullYear(),
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Rama</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva rama en el organigrama.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Rama</Label>
            <Input
              id="nombre"
              placeholder="Ej: Manada, Tropa, Unidad..."
              value={formData.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción de la rama..."
              className="resize-none"
              rows={3}
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edadMinima">Edad Mínima</Label>
              <Input
                id="edadMinima"
                type="number"
                min="0"
                max="30"
                value={formData.edadMinima}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ 
                  ...prev, 
                  edadMinima: parseInt(e.target.value) || 0 
                }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="edadMaxima">Edad Máxima</Label>
              <Input
                id="edadMaxima"
                type="number"
                min="0"
                max="30"
                value={formData.edadMaxima}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ 
                  ...prev, 
                  edadMaxima: parseInt(e.target.value) || 0 
                }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="año">Año</Label>
            <Input
              id="año"
              type="number"
              min="2020"
              max="2030"
              value={formData.año}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ 
                ...prev, 
                año: parseInt(e.target.value) || new Date().getFullYear() 
              }))}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Rama'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
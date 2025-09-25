import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Rama, UpdateRamaData } from '../types/rama.type';

interface EditRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rama: Rama | null;
  onSubmit: (data: UpdateRamaData) => Promise<void>;
}

export default function EditRamaModal({
  open,
  onOpenChange,
  rama,
  onSubmit,
}: EditRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateRamaData>({
    id: '',
    nombre: '',
    descripcion: '',
    edadMinima: 0,
    edadMaxima: 0,
    estado: 'activa',
  });

  useEffect(() => {
    if (rama) {
      setFormData({
        id: rama.id,
        nombre: rama.nombre,
        descripcion: rama.descripcion,
        edadMinima: rama.edadMinima,
        edadMaxima: rama.edadMaxima,
        estado: rama.estado,
      });
    }
  }, [rama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error al editar rama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rama) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-lg border-0" showCloseButton={false}>
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-[#1A4134] pr-8">
            Editar Rama
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la Rama */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Rama</Label>
            <Input
              id="nombre"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1A4134] text-white">
              {isSubmitting ? 'Guardando...' : 'Guardar Rama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

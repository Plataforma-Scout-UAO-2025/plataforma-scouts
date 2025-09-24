import { useState } from 'react';
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
import type { CreateSubramaFormData } from '../schemas/rama.schema';

interface CreateSubramaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ramaId: string;
  onSubmit: (data: CreateSubramaFormData) => Promise<void>;
}

export default function CreateSubramaModal({
  open,
  onOpenChange,
  ramaId,
  onSubmit,
}: CreateSubramaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData: CreateSubramaFormData = {
        ...formData,
        ramaId: ramaId,
      };
      await onSubmit(submitData);
      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear subrama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-lg border-0" showCloseButton={false}>
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-[#1A4134] pr-8">
            Crear Nueva Subrama
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
          {/* Campo Nombre de la Subrama */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
              Nombre de la Subrama
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, nombre: e.target.value }))
              }
              className="w-full bg-white border border-gray-300 rounded-md focus:ring-[#1A4134] focus:border-[#1A4134] placeholder:text-gray-500"
              required
            />
          </div>

          {/* Campo Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción opcional..."
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData(prev => ({ ...prev, descripcion: e.target.value }))
              }
              className="w-full bg-[#FFFAF3] border border-gray-300 rounded-md resize-none focus:ring-[#1A4134] focus:border-[#1A4134] min-h-[100px] placeholder:text-gray-500"
              rows={4}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#1A4134] hover:bg-[#29765C] text-white"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Subrama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
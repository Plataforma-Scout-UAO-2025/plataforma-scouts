import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import type { Subrama } from '@/_mocks/organigramaData'

interface SubramaFormProps {
  initialData?: Partial<Subrama>
  onSubmit: (data: Omit<Subrama, 'id'>) => void
  onCancel: () => void
  ramaId: string
}

export default function SubramaForm({ initialData, onSubmit, onCancel, ramaId }: SubramaFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    ramaId: initialData?.ramaId || ramaId,
    icono: initialData?.icono || '',
    descripcion: initialData?.descripcion || '',
    año: initialData?.año || new Date().getFullYear()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-[Poppins]">
      {/* Nombre de la Subrama */}
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-sm font-medium text-[#282828]">
          Nombre de la Subrama
        </Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej. Patrulla de Leones"
          required
          className="bg-[#FFFAF3] border-[#EDEDED] focus:border-[#1A4134] focus:ring-[#1A4134]/20"
        />
      </div>

      {/* Icono */}
      <div className="space-y-2">
        <Label htmlFor="icono" className="text-sm font-medium text-[#282828]">
          Icono
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-[#FFFAF3]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar icono
          </Button>
          <span className="text-sm text-[#717171]">Ningún archivo seleccionado</span>
        </div>
      </div>

      {/* Galería de imágenes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#282828]">
          Galería de imágenes
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-[#FFFAF3]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir imágenes a la galería
          </Button>
          <span className="text-sm text-[#717171]">Ningún archivo seleccionado</span>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion" className="text-sm font-medium text-[#282828]">
          Descripción
        </Label>
        <textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          placeholder="Descripción opcional de la subrama..."
          rows={4}
          className="w-full min-h-[100px] px-3 py-2 text-sm border border-[#EDEDED] rounded-md bg-[#FFFAF3] placeholder-[#717171] focus:border-[#1A4134] focus:outline-none focus:ring-2 focus:ring-[#1A4134]/20 resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-[#FFFAF3]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-[#1A4134] hover:bg-[#1A4134]/90 text-white"
        >
          Guardar Subrama
        </Button>
      </div>
    </form>
  )
}
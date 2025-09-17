import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import type { Rama } from '@/_mocks/organigramaData'

interface RamaFormProps {
  initialData?: Partial<Rama>
  onSubmit: (data: Omit<Rama, 'id'>) => void
  onCancel: () => void
}

export default function RamaForm({ initialData, onSubmit, onCancel }: RamaFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    nombreSubramaSingular: initialData?.nombreSubramaSingular || '',
    nombreSubramaPlural: initialData?.nombreSubramaPlural || '',
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
    <form onSubmit={handleSubmit} className="space-y-4 font-[Poppins]">
      {/* Nombre de la Rama */}
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-sm font-medium text-[#282828]">
          Nombre de la Rama
        </Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej. Manada, Tropa"
          required
          className="w-full h-11 bg-white border-[#EDEDED] focus:border-[#1A4134] focus:ring-[#1A4134]/20 text-[#282828]"
        />
      </div>

      {/* Nombre para una Subrama */}
      <div className="space-y-2">
        <Label htmlFor="nombreSubramaSingular" className="text-sm font-medium text-[#282828]">
          Nombre para una Subrama
        </Label>
        <Input
          id="nombreSubramaSingular"
          value={formData.nombreSubramaSingular}
          onChange={(e) => handleChange('nombreSubramaSingular', e.target.value)}
          placeholder="Ej. Patrulla, Seisena"
          required
          className="w-full h-11 bg-white border-[#EDEDED] focus:border-[#1A4134] focus:ring-[#1A4134]/20 text-[#282828]"
        />
      </div>

      {/* Nombre para varias Subramas */}
      <div className="space-y-2">
        <Label htmlFor="nombreSubramaPlural" className="text-sm font-medium text-[#282828]">
          Nombre para varias Subramas
        </Label>
        <Input
          id="nombreSubramaPlural"
          value={formData.nombreSubramaPlural}
          onChange={(e) => handleChange('nombreSubramaPlural', e.target.value)}
          placeholder="Ej. Patrullas, Seisenas"
          required
          className="w-full h-11 bg-white border-[#EDEDED] focus:border-[#1A4134] focus:ring-[#1A4134]/20 text-[#282828]"
        />
      </div>

      {/* Icono */}
      <div className="space-y-2">
        <Label htmlFor="icono" className="text-sm font-medium text-[#282828]">
          Icono
        </Label>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 px-4 border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-white justify-start"
        >
          <Upload className="h-4 w-4 mr-2" />
          Seleccionar icono
        </Button>
      </div>

      {/* Galería de imágenes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#282828]">
          Galería de imágenes
        </Label>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 px-4 border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-white justify-start"
        >
          <Upload className="h-4 w-4 mr-2" />
          Subir imágenes a la galería
        </Button>
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
          placeholder="Descripción opcional del rama..."
          rows={4}
          className="w-full min-h-[100px] px-3 py-2 text-sm border border-[#EDEDED] rounded-md bg-white placeholder-[#717171] focus:border-[#1A4134] focus:outline-none focus:ring-2 focus:ring-[#1A4134]/20 resize-none text-[#282828]"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] bg-white"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-[#1A4134] hover:bg-[#1A4134]/90 text-white"
        >
          Guardar Rama
        </Button>
      </div>
    </form>
  )
}
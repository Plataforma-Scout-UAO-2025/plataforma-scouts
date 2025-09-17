import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import SubramaForm from '@/components/forms/SubramaForm'
import type { Subrama } from '@/_mocks/organigramaData'
import { createSubrama, updateSubrama } from '@/lib/api'

interface SubramaModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  subrama?: Subrama
  ramaId: string
  onSuccess?: (subrama: Subrama) => void
}

export default function SubramaModal({ 
  isOpen, 
  onClose, 
  mode, 
  subrama, 
  ramaId,
  onSuccess 
}: SubramaModalProps) {
  const isEditing = mode === 'edit'
  const title = isEditing ? 'Editor Patrulla Leones' : 'Crear Nueva Subrama'

  const handleSubmit = async (data: Omit<Subrama, 'id'>) => {
    try {
      let result: Subrama
      
      if (isEditing && subrama) {
        result = await updateSubrama(subrama.id, data)
      } else {
        result = await createSubrama(data)
      }
      
      onSuccess?.(result)
      onClose()
    } catch (error) {
      console.error('[SubramaModal] Error al guardar subrama:', error)
      // TODO: Mostrar mensaje de error al usuario
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg transform -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[#FFFAF3] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-[#282828] font-[Poppins]">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-[#EDEDED]"
              >
                <X className="h-4 w-4 text-[#717171]" />
              </Button>
            </Dialog.Close>
          </div>
          
          <SubramaForm
            initialData={subrama}
            ramaId={ramaId}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
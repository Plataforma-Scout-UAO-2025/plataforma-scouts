import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import RamaForm from '@/components/forms/RamaForm'
import type { Rama } from '@/_mocks/organigramaData'
import { createRama, updateRama } from '@/lib/api'

interface RamaModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  rama?: Rama
  onSuccess?: (rama: Rama) => void
}

export default function RamaModal({ isOpen, onClose, mode, rama, onSuccess }: RamaModalProps) {
  const isEditing = mode === 'edit'
  const title = isEditing ? `Editor ${rama?.nombre || 'Rama'}` : 'Crear Nueva Rama'

  const handleSubmit = async (data: Omit<Rama, 'id'>) => {
    try {
      let result: Rama
      
      if (isEditing && rama) {
        result = await updateRama(rama.id, data)
      } else {
        result = await createRama(data)
      }
      
      onSuccess?.(result)
      onClose()
    } catch (error) {
      console.error('[RamaModal] Error al guardar rama:', error)
      // TODO: Mostrar mensaje de error al usuario
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl transform -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[#FFFAF3] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-[#282828] font-[Poppins]">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-[#EDEDED] rounded-md"
              >
                <X className="h-4 w-4 text-[#717171]" />
              </Button>
            </Dialog.Close>
          </div>
          
          <RamaForm
            initialData={rama}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
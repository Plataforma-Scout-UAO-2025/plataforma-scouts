import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmacionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warningMessage?: string
}

export default function ConfirmacionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage
}: ConfirmacionModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md transform -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[#FFFAF3] p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-[#282828] font-[Poppins]">
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
          
          <div className="space-y-4">
            <Dialog.Description className="text-sm text-[#282828] font-[Poppins]">
              {message}
            </Dialog.Description>
            
            {warningMessage && (
              <div className="rounded-md bg-[#EDEDED] px-3 py-2">
                <p className="text-sm text-[#717171] font-[Poppins]">
                  {warningMessage}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#EDEDED] text-[#717171] hover:bg-[#EDEDED] font-[Poppins]"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-[#DC2626] hover:bg-[#DC2626]/90 text-white font-[Poppins]"
            >
              Eliminar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Check } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A4134] text-white max-w-sm rounded-lg flex flex-col items-center justify-center py-10 space-y-4">
        <p className="text-lg font-medium">{message}</p>
        <Check className="h-10 w-10 text-white" />
      </DialogContent>
    </Dialog>
  )
}

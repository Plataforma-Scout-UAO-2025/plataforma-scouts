import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Eye } from 'lucide-react';
import { useState } from 'react'
import PaymentsDetailTable from './PaymentsDetailTable';
import type { InstallmentPayment } from '@/types/pago.type';
import type { PaymentRecord } from '@/types/pago.type';

export default function PaymentsDetailModal({member, installment}: {member: PaymentRecord, installment: InstallmentPayment[]}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button size="icon">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-none overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Detalles del pago de {member.first_name + " " + member.last_name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <PaymentsDetailTable installment={installment} member_id={member.member_id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Eye } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react'
import PaymentsDetailTable from './PaymentsDetailTable';
import type { InstallmentPayment } from '@/types/pago.type';
import type { PaymentRecord } from '@/types/pago.type';
import api from '@/api/axios';
import { useTenant } from '@/hooks/useTenant';

export default function PaymentsDetailModal({member}: {member: PaymentRecord}) {
  const [open, setOpen] = useState(false);
  const [installment, setInstallment] = useState<InstallmentPayment[]>([]);
  const tenantId = useTenant();

  const fetchInstallment = useCallback(async () => {
    const response = await api.get(`/finanzas/payments/installments/${tenantId}/${member.member_id}`);
    setInstallment(response.data);
  }, [member.member_id, tenantId]);

  useEffect(() => {
    if (open) {
      fetchInstallment();
    }
  }, [open, fetchInstallment]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button size="icon">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-none overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Detalles de los pagos de {member.first_name + " " + member.last_name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <PaymentsDetailTable installment={installment} member_id={member.member_id} onRefresh={fetchInstallment} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

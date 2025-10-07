import { useEffect, useState } from "react";
import PagosTable from "./components/PagosTable";
import type { PaymentRecord } from "@/types/pago.type";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

// Datos mock para pagos
// const mockPagos: PaymentRecord[] = [
//   {
//     member_id: "1",
//     first_name: "Juan",
//     last_name: "Perez",
//     age: 20,
//     subgroup: {
//       subgroup_id: "1",
//       subgroup_name: "Subgrupo 1",
//     },
//     section: {
//       section_id: "1",
//       section_name: "Sección 1",
//     },
//     installment: [
//       {
//         installment_id: "1",
//         name: "Cuota 1",
//         due_date: new Date(),
//         amount: 100,
//         status: "PAID",
//         payment_id: crypto.randomUUID(),
//         paid_at: new Date(),
//         method: "Efectivo",
//         reference: "1234567890",
//         payer_member_id: "1",
//       },
//       {
//         installment_id: "2",
//         name: "Cuota 2",
//         due_date: new Date(),
//         amount: 100,
//         status: "PENDING",
//         payment_id: null,
//         paid_at: null,
//         method: null,
//         reference: null,
//         payer_member_id: null,
//       },
//       {
//         installment_id: "3",
//         name: "Cuota 3",
//         due_date: new Date(),
//         amount: 100,
//         status: "OVERDUE",
//         payment_id: null,
//         paid_at: null,
//         method: null,
//         reference: null,
//         payer_member_id: null,
//       },
//     ],
//   },
//   {
//     member_id: "2",
//     first_name: "Maria",
//     last_name: "Gomez",
//     age: 25,
//     subgroup: {
//       subgroup_id: "2",
//       subgroup_name: "Subgrupo 2",
//     },
//     section: {
//       section_id: "2",
//       section_name: "Sección 2",
//     },
//     installment: [
//       {
//         installment_id: "1",
//         name: "Cuota 1",
//         due_date: new Date(),
//         amount: 100,
//         status: "PAID",
//         payment_id: crypto.randomUUID(),
//         paid_at: new Date(),
//         method: "Tarjeta de Debito",
//         reference: "1234567890",
//         payer_member_id: "2",
//       },
//       {
//         installment_id: "2",
//         name: "Cuota 2",
//         due_date: new Date(),
//         amount: 100,
//         status: "PAID",
//         payment_id: crypto.randomUUID(),
//         paid_at: new Date(),
//         method: "Efectivo",
//         reference: "1234567890",
//         payer_member_id: "2",
//       },
//       {
//         installment_id: "3",
//         name: "Cuota 3",
//         due_date: new Date(),
//         amount: 100,
//         status: "PENDING",
//         payment_id: null,
//         paid_at: null,
//         method: null,
//         reference: null,
//         payer_member_id: null,
//       },
//       {
//         installment_id: "4",
//         name: "Cuota 4",
//         due_date: new Date(),
//         amount: 100,
//         status: "PENDING",
//         payment_id: null,
//         paid_at: null,
//         method: null,
//         reference: null,
//         payer_member_id: null,
//       },
//     ],
//   }
// ];

export default function Pagos() {
  const [pagos, setPagos] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      // Simular llamada a API con datos mock
      try {
        const response = await api.get("/finanzas/payments/members/" + "org_6B3k4dao2Wf6eGxa");
        setPagos(response.data);
      } catch (error) {
        toast.error("Error al obtener los pagos");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Gestión de Pagos
          </h1>
          <p className="text-muted-foreground text-sm">
            En esta sección puedes visualizar todos los pagos realizados por los
            miembros del grupo scout, incluyendo el estado de cada pago, el medio
            de pago utilizado y la información detallada de cada transacción.
          </p>
        </div>
      </div>
      <PagosTable pagos={pagos} />
      {loading && (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

import CreatePagoModal from "./CreatePagoModal";
import type { InstallmentPayment, PaymentStatus } from "@/types/pago.type";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

const statusDict: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
};

export const paymentsDetailTableColumns: ColumnDef<InstallmentPayment>[] = [
  {
    accessorKey: "installment_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "due_date",
    header: "Fecha de vencimiento",
    cell: ({ row }) =>
      row.original.due_date ? format(row.original.due_date, "dd/MM/yyyy") : "-",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const installment = row.original;
      return installment.amount.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const installment = row.original;
      return (
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            installment.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : installment.status === "PAID"
              ? "bg-green-100 text-green-800"
              : installment.status === "OVERDUE"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {statusDict[installment.status]}
        </div>
      );
    },
  },
  {
    accessorKey: "payment_id",
    header: "ID de pago",
    cell: ({ row }) => {
      const installment = row.original;
      return installment.payment_id ? installment.payment_id : "-";
    },
  },
  {
    accessorKey: "paid_at",
    header: "Fecha de pago",
    cell: ({ row }) =>
      row.original.paid_at ? format(row.original.paid_at, "dd/MM/yyyy") : "-",
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => {
      const installment = row.original;
      return installment.method ? installment.method : "-";
    },
  },
  {
    accessorKey: "reference",
    header: "Referencia",
    cell: ({ row }) => {
      const installment = row.original;
      return installment.reference ? installment.reference : "-";
    },
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <>
          {row.original.status !== "PAID" && (
            <div className="flex justify-start items-center gap-2">
              <CreatePagoModal
                pago={{
                  paid_at: row.original.paid_at?.toISOString() || "",
                  method: row.original.method || "",
                  reference: row.original.reference || "",
                  installment_id: row.original.installment_id || "",
                  payer_member_id: row.original.payer_member_id || "",
                  name: row.original.name || "",
                }}
              />
            </div>
          )}
        </>
      );
    },
  },
];

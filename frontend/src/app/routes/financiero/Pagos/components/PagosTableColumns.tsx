import type { PaymentRecord } from "@/types/pago.type";
import type { ColumnDef } from "@tanstack/react-table";
import PaymentsDetailModal from "./PaymentsDetailModal";

export const columns: ColumnDef<PaymentRecord>[] = [
  {
    accessorKey: "member_id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("member_id")}</div>,
  },
  {
    accessorKey: "first_name",
    header: "Nombre",
    cell: ({ row }) => (
      <div>{row.original.first_name + " " + row.original.last_name}</div>
    ),
  },
  {
    accessorKey: "age",
    header: "Edad",
    cell: ({ row }) => <div>{row.original.age || "-"}</div>,
  },
  {
    accessorKey: "subgroup",
    header: "Subgrupo",
    cell: ({ row }) => <div>{row.original.subgroup.name}</div>,
  },
  {
    accessorKey: "section",
    header: "Sección",
    cell: ({ row }) => <div>{row.original.section.name}</div>,
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="flex justify-start items-center gap-2">
          <PaymentsDetailModal
            member={member}
          />
        </div>
      );
    },
  },
];

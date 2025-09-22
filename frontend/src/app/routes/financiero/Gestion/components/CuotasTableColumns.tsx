import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { ArrowUpDown } from "lucide-react";
import { type Cuota } from "../types/cuota.type";
import EditCuotaModal from "./EditCuotaModal";
import DeleteCuotaModal from "./DeleteCuotaModal";

export const columns: ColumnDef<Cuota>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("nombre")}</div>
      ),
    },
    {
      accessorKey: "monto",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Monto
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const monto = parseFloat(row.getValue("monto"));
  
        const formatted = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
        }).format(monto);
  
        return <div className="text-left font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "periodicidad",
      header: "Periodicidad",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("periodicidad")}</div>
      ),
    },
    {
      accessorKey: "tipoCuota",
      header: "Tipo de cuota",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("tipoCuota")}</div>
      ),
    },
    {
      accessorKey: "fechaLimitePago",
      header: "Fecha límite",
      cell: ({ row }) => <div>{row.getValue("fechaLimitePago")}</div>,
    },
    {
      accessorKey: "medioPago",
      header: "Medio de pago",
      cell: ({ row }) => <div>{row.getValue("medioPago")}</div>,
    },
    {
      accessorKey: "aplicaA",
      header: "Aplica a",
      cell: ({ row }) => <div>{row.getValue("aplicaA")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cuota = row.original;
  
        return (
          <div className="flex items-center gap-2">
            <EditCuotaModal cuota={cuota} />
            <DeleteCuotaModal cuota={cuota} />
          </div>
        );
      },
    },
  ];
  
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { ArrowUpDown } from "lucide-react";
import { type Cuota } from "@/types/cuota.type";
import EditCuotaModal from "./EditCuotaModal";
import DeleteCuotaModal from "./DeleteCuotaModal";

// Traducciones para periodicidad
const periodicityTranslations: Record<string, string> = {
  SINGLE: "Única",
  MONTH: "Mensual",
  QUARTER: "Trimestral",
  YEAR: "Anual",
};

// Traducciones para scope
const scopeTranslations: Record<string, string> = {
  ALL: "Todos",
  SCOUT: "Scout específico",
  SUBGROUP: "Subgrupo",
  SECTION: "Sección",
};

export const getColumns = (onRefresh?: () => void): ColumnDef<Cuota>[] => [
    {
      accessorKey: "name",
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
        <div>{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "amount",
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
        const amount = parseFloat(row.getValue("amount"));

        const formatted = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
        }).format(amount);

        return <div className="text-left font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "periodicity",
      header: "Periodicidad",
      cell: ({ row }) => {
        const periodicity = row.getValue("periodicity") as string;
        return <div>{periodicityTranslations[periodicity] || periodicity}</div>;
      },
    },
    {
      accessorKey: "scope",
      header: "Tipo de cuota",
      cell: ({ row }) => {
        const scope = row.getValue("scope") as string;
        return <div>{scopeTranslations[scope] || scope}</div>;
      },
    },
    {
      accessorKey: "start_date",
      header: "Fecha inicio",
      cell: ({ row }) => <div>{row.getValue("start_date")}</div>,
    },
    {
      accessorKey: "end_date",
      header: "Fecha fin",
      cell: ({ row }) => <div>{row.getValue("end_date")}</div>,
    },
    {
      accessorKey: "member",
      header: "Aplica a",
      cell: ({ row }) => {
        const scope = row.original.scope;

        const value = row.original.associated_to ? row.original.associated_to.name : scopeTranslations[scope] || scope;

        return <div>{value}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cuota = row.original;

        return (
          <div className="flex items-center gap-2">
            <EditCuotaModal cuota={cuota} onRefresh={onRefresh} />
            <DeleteCuotaModal cuota={cuota} onRefresh={onRefresh} />
          </div>
        );
      },
    },
  ];
  
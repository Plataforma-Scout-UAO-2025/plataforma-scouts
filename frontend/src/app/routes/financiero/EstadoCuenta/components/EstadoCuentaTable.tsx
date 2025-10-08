"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { CuotasEstado } from "@/types/estado-cuenta.type";
import type { PaymentStatus } from "@/types/pago.type";

interface EstadoCuentaTableProps {
  cuotas: CuotasEstado[];
}

// Mapeo de estados
const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencida",
};

const statusStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
};

// Columnas para la tabla de cuotas
const cuotasColumns: ColumnDef<CuotasEstado>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre de Cuota
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDateValue = row.getValue("due_date") as string | Date;
      const dueDateMonth = new Date(dueDateValue);
      const dueDateMonthName = dueDateMonth.toLocaleDateString("es-CO", { month: "long" }).charAt(0).toUpperCase() + dueDateMonth.toLocaleDateString("es-CO", { month: "long" }).slice(1);

      return <div className="">{row.getValue("name")} ({dueDateMonthName})</div>
    },
  },
  {
    accessorKey: "member_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Integrante
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("member_name")}</div>,
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const monto = row.getValue("amount") as number;
      const formatted = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
      }).format(monto);
      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Vencimiento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fecha = row.getValue("due_date") as string | Date;
      return <div>{new Date(fecha).toLocaleDateString("es-CO")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as PaymentStatus;
      return (
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </div>
      );
    },
  },
  {
    accessorKey: "paid_at",
    header: "Fecha de Pago",
    cell: ({ row }) => {
      const fecha = row.getValue("paid_at") as Date | null;
      return (
        <div>
          {fecha ? new Date(fecha).toLocaleDateString("es-CO") : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ row }) => {
      const method = row.getValue("method") as string | null;
      return <div>{method || "N/A"}</div>;
    },
  },
  {
    accessorKey: "reference",
    header: "Referencia",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string | null;
      return <div className="max-w-[150px] truncate">{reference || "N/A"}</div>;
    },
  },
];

export default function EstadoCuentaTable({
  cuotas,
}: EstadoCuentaTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  // Filtrar cuotas por estado
  const filteredCuotas = React.useMemo(() => {
    if (selectedStatus === "all") return cuotas;
    return cuotas.filter((cuota) => cuota.status === selectedStatus);
  }, [cuotas, selectedStatus]);

  // Estados únicos de cuotas
  const uniqueStatuses = React.useMemo(() => {
    return Array.from(new Set(cuotas.map((cuota) => cuota.status)));
  }, [cuotas]);

  const table = useReactTable({
    data: filteredCuotas,
    columns: cuotasColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card className="w-full p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Cuotas</h2>
          <span className="text-sm text-muted-foreground">
            {cuotas.length} cuota(s) en total
          </span>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={
              (table.getColumn("name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status as PaymentStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={cuotasColumns.length}
                    className="h-24 text-center"
                  >
                    No hay cuotas para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

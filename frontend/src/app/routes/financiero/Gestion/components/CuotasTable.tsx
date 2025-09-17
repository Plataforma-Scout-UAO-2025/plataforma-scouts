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
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateCuotaModal from "./CreateCuotaModal";
import EditCuotaModal from "./EditCuotaModal";
import DeleteCuotaModal from "./DeleteCuotaModal";
import type { Cuota } from "../types/cuota.type";

export const mockCuotas: Cuota[] = [
  {
    id: "1",
    nombre: "Cuota 1",
    monto: "100000",
    periodicidad: "Mensual",
    tipoCuota: "Ordinaria",
    fechaLimitePago: "28 de cada mes",
    medioPago: "PSE",
    aplicaA: "Todos",
  },
  {
    id: "2",
    nombre: "Cuota 2",
    monto: "200000",
    periodicidad: "Trimestral",
    tipoCuota: "Ordinaria",
    fechaLimitePago: "7 de cada mes",
    medioPago: "PSE",
    aplicaA: "Todos",
  },
  {
    id: "3",
    nombre: "Cuota 3",
    monto: "300000",
    periodicidad: "Semestral",
    tipoCuota: "Ordinaria",
    fechaLimitePago: "20 de cada mes",
    medioPago: "PSE",
    aplicaA: "Todos",
  },
];

export const columns: ColumnDef<Cuota>[] = [
  {
    id: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase text-center">{row.original.id}</div>,
  },
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

export default function CuotasTable({
  cuotas = mockCuotas,
}: {
  cuotas?: Cuota[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: cuotas,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filtrar por nombre..."
            value={
              (table.getColumn("nombre")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("nombre")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <CreateCuotaModal />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
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
  );
}

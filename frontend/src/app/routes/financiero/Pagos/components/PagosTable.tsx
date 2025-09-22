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
import CreatePagoModal from "./CreatePagoModal";
import PagoDetailModal from "./PagoDetailModal";
import type { Pago } from "../types/pago.type";
import { mockScouts, mockCuotas } from "../constants/mockData";

// Funciones helper para obtener nombres por ID
const getScoutName = (scoutId: string) => {
  const scout = mockScouts.find(s => s.id === scoutId);
  return scout ? `${scout.nombre} (${scout.rama})` : scoutId;
};

const getCuotaName = (cuotaId: string) => {
  const cuota = mockCuotas.find(c => c.id === cuotaId);
  return cuota ? `${cuota.nombre} - $${cuota.monto}` : cuotaId;
};

export const columns: ColumnDef<Pago>[] = [
  {
    accessorKey: "concepto",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Concepto
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("concepto")}</div>,
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
    accessorKey: "fechaPago",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de pago
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fecha = row.getValue("fechaPago") as string;
      return <div>{new Date(fecha).toLocaleDateString("es-CO")}</div>;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return (
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            estado === "Pagado"
              ? "bg-green-100 text-green-800"
              : estado === "Pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {estado}
        </div>
      );
    },
  },
  {
    accessorKey: "medioPago",
    header: "Medio de pago",
    cell: ({ row }) => <div>{row.getValue("medioPago")}</div>,
  },
  {
    accessorKey: "cuotaId",
    header: "Cuota",
    cell: ({ row }) => <div>{getCuotaName(row.getValue("cuotaId"))}</div>,
  },
  {
    accessorKey: "scoutId",
    header: "Integrante",
    cell: ({ row }) => <div>{getScoutName(row.getValue("scoutId"))}</div>,
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    cell: ({ row }) => {
      const pago = row.original;

      return (
        <div className="flex justify-center items-center gap-2">
          <PagoDetailModal pago={pago} />
        </div>
      );
    },
  },
];

export default function PagosTable({
  pagos = [],
}: {
  pagos?: Pago[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Estados para los filtros personalizados
  const [selectedScout, setSelectedScout] = React.useState<string>("all");
  const [selectedEstado, setSelectedEstado] = React.useState<string>("all");

  // Filtrar datos según los filtros seleccionados
  const filteredData = React.useMemo(() => {
    let filtered = pagos;
    
    if (selectedScout && selectedScout !== "all") {
      filtered = filtered.filter(pago => pago.scoutId === selectedScout);
    }
    
    if (selectedEstado && selectedEstado !== "all") {
      filtered = filtered.filter(pago => pago.estado === selectedEstado);
    }
    
    return filtered;
  }, [pagos, selectedScout, selectedEstado]);

  const table = useReactTable({
    data: filteredData,
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

  // Obtener listas únicas para los filtros
  const uniqueScouts = React.useMemo(() => {
    const scouts = Array.from(new Set(pagos.map(pago => pago.scoutId)))
      .map(scoutId => {
        const scout = mockScouts.find(s => s.id === scoutId);
        return {
          id: scoutId,
          nombre: scout ? `${scout.nombre} (${scout.rama})` : scoutId
        };
      });
    return scouts;
  }, [pagos]);

  const uniqueEstados = React.useMemo(() => {
    return Array.from(new Set(pagos.map(pago => pago.estado)));
  }, [pagos]);

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filtrar por concepto..."
            value={
              (table.getColumn("concepto")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("concepto")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          
          <Select
            value={selectedScout}
            onValueChange={setSelectedScout}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por integrante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los integrantes</SelectItem>
              {uniqueScouts.map((scout) => (
                <SelectItem key={scout.id} value={scout.id}>
                  {scout.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedEstado}
            onValueChange={setSelectedEstado}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {uniqueEstados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreatePagoModal />
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

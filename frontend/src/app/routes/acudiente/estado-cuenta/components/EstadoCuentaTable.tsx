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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CuotaConEstado, PagoRealizado } from "../types/estadoCuenta.type";

interface EstadoCuentaTableProps {
  cuotas: CuotaConEstado[];
  pagos: PagoRealizado[];
}

// Columnas para la tabla de cuotas
const cuotasColumns: ColumnDef<CuotaConEstado>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cuota
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
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
    accessorKey: "fechaLimitePago",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Límite
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fecha = row.getValue("fechaLimitePago") as string;
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
            estado === "Pagada"
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
];

// Columnas para la tabla de pagos
const pagosColumns: ColumnDef<PagoRealizado>[] = [
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("concepto")}</div>,
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
          Fecha de Pago
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
    accessorKey: "medioPago",
    header: "Medio de Pago",
    cell: ({ row }) => <div>{row.getValue("medioPago")}</div>,
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
];

export default function EstadoCuentaTable({ cuotas, pagos }: EstadoCuentaTableProps) {
  const [cuotasFilters, setCuotasFilters] = React.useState<ColumnFiltersState>([]);
  const [pagosFilters, setPagosFilters] = React.useState<ColumnFiltersState>([]);
  const [selectedEstadoCuota, setSelectedEstadoCuota] = React.useState<string>("all");

  // Filtrar cuotas por estado
  const filteredCuotas = React.useMemo(() => {
    if (selectedEstadoCuota === "all") return cuotas;
    return cuotas.filter(cuota => cuota.estado === selectedEstadoCuota);
  }, [cuotas, selectedEstadoCuota]);

  // Estados únicos de cuotas
  const uniqueEstadosCuotas = React.useMemo(() => {
    return Array.from(new Set(cuotas.map(cuota => cuota.estado)));
  }, [cuotas]);

  // Tabla de cuotas
  const cuotasTable = useReactTable({
    data: filteredCuotas,
    columns: cuotasColumns,
    onColumnFiltersChange: setCuotasFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: cuotasFilters,
    },
  });

  // Tabla de pagos
  const pagosTable = useReactTable({
    data: pagos,
    columns: pagosColumns,
    onColumnFiltersChange: setPagosFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: pagosFilters,
    },
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="cuotas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cuotas">Cuotas ({cuotas.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos Realizados ({pagos.length})</TabsTrigger>
        </TabsList>
        
        {/* Tab de Cuotas */}
        <TabsContent value="cuotas" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar cuotas..."
              value={(cuotasTable.getColumn("nombre")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                cuotasTable.getColumn("nombre")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            
            <Select
              value={selectedEstadoCuota}
              onValueChange={setSelectedEstadoCuota}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {uniqueEstadosCuotas.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {cuotasTable.getHeaderGroups().map((headerGroup) => (
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
                {cuotasTable.getRowModel().rows?.length ? (
                  cuotasTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={cuotasColumns.length} className="h-24 text-center">
                      No hay cuotas para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab de Pagos */}
        <TabsContent value="pagos" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar pagos..."
              value={(pagosTable.getColumn("concepto")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                pagosTable.getColumn("concepto")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {pagosTable.getHeaderGroups().map((headerGroup) => (
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
                {pagosTable.getRowModel().rows?.length ? (
                  pagosTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={pagosColumns.length} className="h-24 text-center">
                      No hay pagos realizados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


"use client";

import * as React from "react";
import {
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
import type { PaymentRecord } from "@/types/pago.type";
import { columns } from "./PagosTableColumns";

export default function PagosTable({
  pagos = [],
}: {
  pagos?: PaymentRecord[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Estados para los filtros personalizados
  const [selectedSubgroup, setSelectedSubgroup] = React.useState<string>("all");
  const [selectedSection, setSelectedSection] = React.useState<string>("all");

  // Filtrar datos según los filtros seleccionados
  const filteredData = React.useMemo(() => {
    let filtered = pagos;

    if (selectedSubgroup && selectedSubgroup !== "all") {
      filtered = filtered.filter(pago => pago.subgroup.id === selectedSubgroup);
    }

    if (selectedSection && selectedSection !== "all") {
      filtered = filtered.filter(pago => pago.section.id === selectedSection);
    }

    return filtered;
  }, [pagos, selectedSubgroup, selectedSection]);

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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });


  const uniqueSubgroups = React.useMemo(() => {
    return Array.from(new Set(pagos.map(pago => pago.subgroup.id)))
      .map(subgroupId => {
        const pago = pagos.find(p => p.subgroup.id === subgroupId);
        return {
          id: subgroupId,
          name: pago?.subgroup.name || subgroupId
        };
      });
  }, [pagos]);

  const uniqueSections = React.useMemo(() => {
    return Array.from(new Set(pagos.map(pago => pago.section.id)))
      .map(sectionId => {
        const pago = pagos.find(p => p.section.id === sectionId);
        return {
          id: sectionId,
          name: pago?.section.name || sectionId
        };
      });
  }, [pagos]);

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre o ID..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />

          <Select
            value={selectedSubgroup}
            onValueChange={setSelectedSubgroup}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por subgrupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los subgrupos</SelectItem>
              {uniqueSubgroups.map((subgroup) => (
                <SelectItem key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSection}
            onValueChange={setSelectedSection}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              {uniqueSections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


        </div>
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

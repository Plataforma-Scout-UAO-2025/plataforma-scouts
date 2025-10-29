import React, { useEffect, useState } from "react";
import type { DashboardFinanciero } from "@/types/dashboard-tesorero.types";
import type { InstallmentPayment, PaymentStatus } from "@/types/pago.type";
import type { MiembroMora } from "@/types/dashboard-tesorero.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircleDollarSign, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "@/api/axios";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Mock Data
// const mockDashboardData: DashboardFinanciero = {
//   kpis: {
//     total_recaudado: 15000000,
//     total_pendiente: 5000000,
//     pagos_vencidos: 8,
//   },
//   porcentaje_cumplimiento: [
//     { nombre: "Manada", porcentaje: 85 },
//     { nombre: "Tropa", porcentaje: 92 },
//     { nombre: "Comunidad", porcentaje: 78 },
//     { nombre: "Clan", porcentaje: 95 },
//   ],
//   ultimos_pagos: [
//     {
//       installment_id: "1",
//       name: "Cuota Enero",
//       due_date: new Date("2025-01-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p1",
//       paid_at: new Date("2025-01-10"),
//       method: "Transferencia",
//       reference: "REF001",
//       payer_member_id: "m1",
//     },
//     {
//       installment_id: "2",
//       name: "Cuota Febrero",
//       due_date: new Date("2025-02-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p2",
//       paid_at: new Date("2025-02-12"),
//       method: "Efectivo",
//       reference: "REF002",
//       payer_member_id: "m2",
//     },
//     {
//       installment_id: "3",
//       name: "Cuota Marzo",
//       due_date: new Date("2025-03-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p3",
//       paid_at: new Date("2025-03-08"),
//       method: "Transferencia",
//       reference: "REF003",
//       payer_member_id: "m3",
//     },
//     {
//       installment_id: "4",
//       name: "Cuota Abril",
//       due_date: new Date("2025-04-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p4",
//       paid_at: new Date("2025-04-10"),
//       method: "PSE",
//       reference: "REF004",
//       payer_member_id: "m4",
//     },
//     {
//       installment_id: "5",
//       name: "Cuota Mayo",
//       due_date: new Date("2025-05-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p5",
//       paid_at: new Date("2025-05-09"),
//       method: "Transferencia",
//       reference: "REF005",
//       payer_member_id: "m5",
//     },
//     {
//       installment_id: "6",
//       name: "Cuota Junio",
//       due_date: new Date("2025-06-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p6",
//       paid_at: new Date("2025-06-08"),
//       method: "PSE",
//       reference: "REF006",
//       payer_member_id: "m6",
//     },
//     {
//       installment_id: "7",
//       name: "Cuota Julio",
//       due_date: new Date("2025-07-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p7",
//       paid_at: new Date("2025-07-12"),
//       method: "Transferencia",
//       reference: "REF007",
//       payer_member_id: "m7",
//     },
//     {
//       installment_id: "8",
//       name: "Cuota Agosto",
//       due_date: new Date("2025-08-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p8",
//       paid_at: new Date("2025-08-09"),
//       method: "Efectivo",
//       reference: "REF008",
//       payer_member_id: "m8",
//     },
//     {
//       installment_id: "9",
//       name: "Cuota Septiembre",
//       due_date: new Date("2025-09-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p9",
//       paid_at: new Date("2025-09-10"),
//       method: "Transferencia",
//       reference: "REF009",
//       payer_member_id: "m9",
//     },
//     {
//       installment_id: "10",
//       name: "Cuota Octubre",
//       due_date: new Date("2025-10-15"),
//       amount: 50000,
//       status: "PAID" as PaymentStatus,
//       payment_id: "p10",
//       paid_at: new Date("2025-10-08"),
//       method: "PSE",
//       reference: "REF010",
//       payer_member_id: "m10",
//     },
//   ],
//   miembros_mora: [
//     {
//       member_id: 101,
//       first_name: "Juan",
//       last_name: "Pérez",
//       subgroup_name: "Manada",
//       amount_debt: 150000,
//     },
//     {
//       member_id: 102,
//       first_name: "María",
//       last_name: "González",
//       subgroup_name: "Tropa",
//       amount_debt: 100000,
//     },
//     {
//       member_id: 103,
//       first_name: "Carlos",
//       last_name: "Rodríguez",
//       subgroup_name: "Comunidad",
//       amount_debt: 200000,
//     },
//     {
//       member_id: 104,
//       first_name: "Ana",
//       last_name: "Martínez",
//       subgroup_name: "Clan",
//       amount_debt: 50000,
//     },
//     {
//       member_id: 105,
//       first_name: "Luis",
//       last_name: "Fernández",
//       subgroup_name: "Manada",
//       amount_debt: 75000,
//     },
//     {
//       member_id: 106,
//       first_name: "Sofía",
//       last_name: "Torres",
//       subgroup_name: "Tropa",
//       amount_debt: 125000,
//     },
//     {
//       member_id: 107,
//       first_name: "Diego",
//       last_name: "Ramírez",
//       subgroup_name: "Comunidad",
//       amount_debt: 180000,
//     },
//     {
//       member_id: 108,
//       first_name: "Valentina",
//       last_name: "López",
//       subgroup_name: "Clan",
//       amount_debt: 90000,
//     },
//     {
//       member_id: 109,
//       first_name: "Andrés",
//       last_name: "Hernández",
//       subgroup_name: "Manada",
//       amount_debt: 110000,
//     },
//     {
//       member_id: 110,
//       first_name: "Camila",
//       last_name: "Díaz",
//       subgroup_name: "Tropa",
//       amount_debt: 160000,
//     },
//     {
//       member_id: 111,
//       first_name: "Santiago",
//       last_name: "Vargas",
//       subgroup_name: "Comunidad",
//       amount_debt: 95000,
//     },
//     {
//       member_id: 112,
//       first_name: "Isabella",
//       last_name: "Castro",
//       subgroup_name: "Clan",
//       amount_debt: 140000,
//     },
//   ],
//   distribucion_pago: {
//     porcentaje_pagado: 60,
//     porcentaje_pendiente: 25,
//     porcentaje_vencido: 15,
//   },
// };

// Componente para formatear números como moneda colombiana
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Diccionario de estados
const statusDict: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
};

// Columnas para la tabla de últimos pagos
const ultimosPagosColumns: ColumnDef<InstallmentPayment>[] = [
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
      row.original.due_date ? row.original.due_date.toString() : "-",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => formatCurrency(row.original.amount),
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
      row.original.paid_at ? row.original.paid_at.toString() : "-",
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
];

// Columnas para la tabla de miembros en mora
const miembrosMoraColumns: ColumnDef<MiembroMora>[] = [
  {
    accessorKey: "member_id",
    header: "ID",
  },
  {
    accessorKey: "first_name",
    header: "Nombre",
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  {
    accessorKey: "subgroup_name",
    header: "Subgrupo",
  },
  {
    accessorKey: "amount_debt",
    header: "Cantidad adeudada",
    cell: ({ row }) => (
      <span className="font-semibold text-red-600">
        {formatCurrency(row.original.amount_debt)}
      </span>
    ),
  },
];

// Componente KPI Card
interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor?: string;
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-primary",
}: KPICardProps) => {
  return (
    <div className="border rounded-xl shadow-sm p-4 flex items-center flex-1">
      <div className="p-4 w-full">
        <div className="pb-4 flex justify-between items-center">
          <p className="text-lg text-text">{label}</p>
          <Icon className={`${iconColor} flex-shrink-0 w-10 h-10`} />
        </div>
        <p className="text-2xl md:text-3xl text-primary font-bold">{value}</p>
      </div>
    </div>
  );
};

// Componente tabla de últimos pagos con paginación
interface UltimosPagosTableProps {
  data: InstallmentPayment[];
}

const UltimosPagosTable = ({ data }: UltimosPagosTableProps) => {
  const table = useReactTable({
    data,
    columns: ultimosPagosColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Últimos pagos</CardTitle>
        <Button variant="link" className="w-min">
          <Link to="/app/financiero/pagos">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
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
                    colSpan={ultimosPagosColumns.length}
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
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
      </CardContent>
    </Card>
  );
};

// Componente tabla de miembros en mora con paginación
interface MiembrosMoraTableProps {
  data: MiembroMora[];
}

const MiembrosMoraTable = ({ data }: MiembrosMoraTableProps) => {
  const table = useReactTable({
    data,
    columns: miembrosMoraColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2">
      <CardHeader>
        <CardTitle>Miembros en mora</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
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
                    colSpan={miembrosMoraColumns.length}
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
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
      </CardContent>
    </Card>
  );
};

// Componente de gráfico doughnut con Chart.js
interface PieChartProps {
  data: {
    porcentaje_pagado: number;
    porcentaje_pendiente: number;
    porcentaje_vencido: number;
  };
}

const PieChart = ({ data }: PieChartProps) => {
  const { porcentaje_pagado, porcentaje_pendiente, porcentaje_vencido } = data;

  const chartData = {
    labels: ["Pagado", "Pendiente", "Vencido"],
    datasets: [
      {
        data: [porcentaje_pagado, porcentaje_pendiente, porcentaje_vencido],
        backgroundColor: [
          "#22c55e", // Verde para pagado
          "#eab308", // Amarillo para pendiente
          "#ef4444", // Rojo para vencido
        ],
        borderColor: ["#16a34a", "#ca8a04", "#dc2626"],
        borderWidth: 2,
        hoverBackgroundColor: ["#16a34a", "#ca8a04", "#dc2626"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label?: string; parsed: number }) {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    cutout: "60%", // Para hacer el gráfico doughnut (con agujero en el centro)
  };

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <div className="w-64 h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default function TesoreroView() {
  const [data, setData] = useState<DashboardFinanciero | null>(null);
  const tenantId = useTenant();

  async function getDashboardData(tenantId: string) {
    try {
      const response = await api.get("finanzas/dashboard/" + tenantId);
      setData(response.data);
    } catch (error) {
      toast.error("Error al obtener los datos del dashboard");
      console.error("Error al obtener los datos del dashboard:", error);
    }
  }
 

  useEffect(() => {
    if (tenantId) {
      getDashboardData(tenantId);
    }
  }, [tenantId]);

  return (
    <div className="mx-4 space-y-6">
      {/* KPIs - Primera fila */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <KPICard
          icon={CircleDollarSign}
          label="Total recaudado"
          value={formatCurrency(data?.kpis.total_recaudado || 0)}
          iconColor="text-green-600"
        />
        <KPICard
          icon={TrendingDown}
          label="Total deuda"
          value={formatCurrency(data?.kpis.total_pendiente || 0)}
          iconColor="text-yellow-600"
        />
        <KPICard
          icon={AlertTriangle}
          label="Pagos vencidos"
          value={data?.kpis.pagos_vencidos || 0}
          iconColor="text-red-600"
        />
      </section>

      {/* Segunda fila - Cumplimiento y Mora */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Porcentaje de cumplimiento mensual por subgrupo */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1">
          <CardHeader>
            <CardTitle>
              Porcentaje de cumplimiento mensual por subgrupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.porcentaje_cumplimiento.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.nombre}</span>
                    <span className="text-sm font-bold text-primary">
                      {item.porcentaje}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${item.porcentaje}%` }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {item.porcentaje >= 20 && `${item.porcentaje}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Miembros en mora */}
        <MiembrosMoraTable data={data?.miembros_mora || []} />
      </section>

      {/* Tercera fila - Últimos pagos y Distribución */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos pagos */}
        <UltimosPagosTable data={data?.ultimos_pagos || []} />

        {/* Distribución estado de pagos mes actual */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1">
          <CardHeader>
            <CardTitle>Distribución estado de pagos mes actual</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <PieChart data={data?.distribucion_pagos || {
               porcentaje_pagado: 0,
               porcentaje_pendiente: 0,
               porcentaje_vencido: 0,
             }} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import React from 'react'
import type { DashboardFinanciero } from '@/types/dashboard-tesorero.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CircleDollarSign, TrendingDown, AlertTriangle } from 'lucide-react'

// Mock Data
const mockDashboardData: DashboardFinanciero = {
  kpis: {
    total_recaudado: 15000000,
    total_pendiente: 5000000,
    pagos_vencidos: 8,
  },
  porcentaje_cumplimiento: [
    { nombre: "Manada", porcentaje: 85 },
    { nombre: "Tropa", porcentaje: 92 },
    { nombre: "Comunidad", porcentaje: 78 },
    { nombre: "Clan", porcentaje: 95 },
  ],
  ultimos_pagos: [
    {
      installment_id: "1",
      name: "Cuota Enero",
      due_date: new Date("2025-01-15"),
      amount: 50000,
      status: "PAID",
      payment_id: "p1",
      paid_at: new Date("2025-01-10"),
      method: "Transferencia",
      reference: "REF001",
      payer_member_id: "m1",
    },
    {
      installment_id: "2",
      name: "Cuota Febrero",
      due_date: new Date("2025-02-15"),
      amount: 50000,
      status: "PAID",
      payment_id: "p2",
      paid_at: new Date("2025-02-12"),
      method: "Efectivo",
      reference: "REF002",
      payer_member_id: "m2",
    },
    {
      installment_id: "3",
      name: "Cuota Marzo",
      due_date: new Date("2025-03-15"),
      amount: 50000,
      status: "PAID",
      payment_id: "p3",
      paid_at: new Date("2025-03-08"),
      method: "Transferencia",
      reference: "REF003",
      payer_member_id: "m3",
    },
    {
      installment_id: "4",
      name: "Cuota Abril",
      due_date: new Date("2025-04-15"),
      amount: 50000,
      status: "PAID",
      payment_id: "p4",
      paid_at: new Date("2025-04-10"),
      method: "PSE",
      reference: "REF004",
      payer_member_id: "m4",
    },
    {
      installment_id: "5",
      name: "Cuota Mayo",
      due_date: new Date("2025-05-15"),
      amount: 50000,
      status: "PAID",
      payment_id: "p5",
      paid_at: new Date("2025-05-09"),
      method: "Transferencia",
      reference: "REF005",
      payer_member_id: "m5",
    },
  ],
  miembros_mora: [
    {
      member_id: 101,
      first_name: "Juan",
      last_name: "Pérez",
      subgroup_name: "Manada",
      amount_debt: 150000,
    },
    {
      member_id: 102,
      first_name: "María",
      last_name: "González",
      subgroup_name: "Tropa",
      amount_debt: 100000,
    },
    {
      member_id: 103,
      first_name: "Carlos",
      last_name: "Rodríguez",
      subgroup_name: "Comunidad",
      amount_debt: 200000,
    },
    {
      member_id: 104,
      first_name: "Ana",
      last_name: "Martínez",
      subgroup_name: "Clan",
      amount_debt: 50000,
    },
  ],
  distribucion_pago: {
    porcentaje_pagado: 60,
    porcentaje_pendiente: 25,
    porcentaje_vencido: 15,
  },
}

// Componente para formatear números como moneda colombiana
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Componente KPI Card
interface KPICardProps {
  icon: React.ElementType
  label: string
  value: string | number
  iconColor?: string
}

const KPICard = ({ icon: Icon, label, value, iconColor = "text-primary" }: KPICardProps) => {
  return (
    <div className="border rounded-xl shadow-sm p-4 flex items-center flex-1">
      <div className="p-4 w-full">
        <div className="pb-4 flex justify-between items-center">
          <p className="text-lg md:text-xl text-text font-bold">
            {label}
          </p>
          <Icon className={`${iconColor} flex-shrink-0 w-10 h-10`} />
        </div>
        <p className="text-2xl md:text-3xl text-primary font-bold">
          {value}
        </p>
      </div>
    </div>
  )
}

// Componente de gráfico circular
interface PieChartProps {
  data: {
    porcentaje_pagado: number
    porcentaje_pendiente: number
    porcentaje_vencido: number
  }
}

const PieChart = ({ data }: PieChartProps) => {
  const { porcentaje_pagado, porcentaje_pendiente, porcentaje_vencido } = data
  
  // Calcular los ángulos para el SVG
  const total = porcentaje_pagado + porcentaje_pendiente + porcentaje_vencido
  const pagadoAngle = (porcentaje_pagado / total) * 360
  const pendienteAngle = (porcentaje_pendiente / total) * 360

  // Función para crear el path del arco
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(50, 50, 40, endAngle)
    const end = polarToCartesian(50, 50, 40, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", 50, 50,
      "L", start.x, start.y,
      "A", 40, 40, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ")
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <svg viewBox="0 0 100 100" className="w-48 h-48">
        <path
          d={createArc(0, pagadoAngle)}
          fill="#22c55e"
          className="transition-all duration-300"
        />
        <path
          d={createArc(pagadoAngle, pagadoAngle + pendienteAngle)}
          fill="#eab308"
          className="transition-all duration-300"
        />
        <path
          d={createArc(pagadoAngle + pendienteAngle, 360)}
          fill="#ef4444"
          className="transition-all duration-300"
        />
      </svg>
      
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Pagado ({porcentaje_pagado}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Pendiente ({porcentaje_pendiente}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Vencido ({porcentaje_vencido}%)</span>
        </div>
      </div>
    </div>
  )
}

export default function TesoreroView() {
  const data = mockDashboardData

  return (
    <div className="mx-4 space-y-6">

      {/* KPIs - Primera fila */}
      <section className="flex gap-6">
        <KPICard
          icon={CircleDollarSign}
          label="Total recaudado"
          value={formatCurrency(data.kpis.total_recaudado)}
          iconColor="text-green-600"
        />
        <KPICard
          icon={TrendingDown}
          label="Total deuda"
          value={formatCurrency(data.kpis.total_pendiente)}
          iconColor="text-yellow-600"
        />
        <KPICard
          icon={AlertTriangle}
          label="Pagos cuotas vencidas"
          value={data.kpis.pagos_vencidos}
          iconColor="text-red-600"
        />
      </section>

      {/* Segunda fila - Cumplimiento y Mora */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Porcentaje de cumplimiento mensual por subgrupo */}
        <Card>
          <CardHeader>
            <CardTitle>% de cumplimiento mensual por subgrupo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.porcentaje_cumplimiento.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.nombre}</span>
                    <span className="text-sm font-bold text-primary">{item.porcentaje}%</span>
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
        <Card>
          <CardHeader>
            <CardTitle>Miembros en mora</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.miembros_mora.map((miembro) => (
                  <TableRow key={miembro.member_id}>
                    <TableCell className="font-medium">
                      {miembro.first_name} {miembro.last_name}
                    </TableCell>
                    <TableCell>{miembro.subgroup_name}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(miembro.amount_debt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Tercera fila - Últimos pagos y Distribución */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ultimos_pagos.map((pago) => (
                  <TableRow key={pago.payment_id}>
                    <TableCell className="font-medium">{pago.name}</TableCell>
                    <TableCell>
                      {pago.paid_at?.toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{pago.method}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(pago.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Distribución estado de pagos mes actual */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución estado de pagos mes actual</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <PieChart data={data.distribucion_pago} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

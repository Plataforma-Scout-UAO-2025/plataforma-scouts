export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión de scouts
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Total Scouts</h3>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Eventos este mes</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Cuotas pendientes</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Próximo evento</h3>
          <p className="text-2xl font-bold">3 días</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Actividades recientes</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Scout Juan completó actividad de primeros auxilios</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Nuevo evento programado: Campamento de verano</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Pago de cuota recibido de María Rodríguez</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Próximos eventos</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Reunión Manada Kuna</span>
              <span className="text-sm text-muted-foreground">Mañana</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Campamento fin de semana</span>
              <span className="text-sm text-muted-foreground">15 Ene</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Actividad comunitaria</span>
              <span className="text-sm text-muted-foreground">22 Ene</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

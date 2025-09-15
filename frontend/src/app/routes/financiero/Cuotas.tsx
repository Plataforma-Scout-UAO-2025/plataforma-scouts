export default function Cuotas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary">Cuotas</h1>
          <p className="text-muted-foreground">
            Gestiona las cuotas y pagos de los scouts
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Total Recaudado</h3>
          <p className="text-2xl font-bold">$2,450,000</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Pendientes</h3>
          <p className="text-2xl font-bold">$850,000</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Scouts Activos</h3>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium text-sm text-muted-foreground">Mes Actual</h3>
          <p className="text-2xl font-bold">Enero</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Cuotas</h2>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Scout {i + 1}</p>
                    <p className="text-sm text-muted-foreground">Manada Kuna</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$50,000</p>
                  <p className={`text-sm ${
                    i % 3 === 0 ? 'text-green-600' : 
                    i % 3 === 1 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {i % 3 === 0 ? 'Pagado' : i % 3 === 1 ? 'Pendiente' : 'Vencido'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

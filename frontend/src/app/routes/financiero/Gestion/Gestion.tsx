import CuotasTable, { mockCuotas } from "./components/CuotasTable";

export default function Gestion() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Cuotas básicas de grupo
          </h1>
          <p className="text-muted-foreground text-sm">
            En esta sección el tesorero puede definir las cuotas financieras del
            grupo scout, estableciendo el monto a pagar, la periodicidad de
            cobro (mensual, trimestral, semestral, anual) y las condiciones
            aplicables según el tipo de miembro, edad, rama o excepciones
            definidas por el grupo.
          </p>
        </div>
      </div>
      <CuotasTable cuotas={mockCuotas} />
    </div>
  );
}

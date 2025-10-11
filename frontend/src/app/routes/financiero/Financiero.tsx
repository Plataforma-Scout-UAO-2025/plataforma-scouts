import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, FileText, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

export default function Financiero() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            Modulo financiero
          </h1>
          <p className="text-muted-foreground pt-2">
            Gestiona las cuotas y pagos de los scouts
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        <Link to="/app/financiero/cuotas/gestion" className="block">
          <Card className="cursor-pointer hover:shadow-lg h-full border-primary border-2 hover:bg-primary group transition-colors duration-200">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
              <ListChecks className="text-primary size-10 group-hover:text-white" />
              <span className="text-lg font-semibold text-center text-primary group-hover:text-white">
                Gestionar cuotas
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/financiero/pagos" className="block">
          <Card className="cursor-pointer hover:shadow-lg h-full border-primary border-2 hover:bg-primary group transition-colors duration-200">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
              <DollarSign className="text-primary size-10 group-hover:text-white" />
              <span className="text-lg font-semibold text-center text-primary group-hover:text-white">
                Gestionar pagos
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/financiero/estado-cuenta" className="block">
          <Card className="cursor-pointer hover:shadow-lg h-full border-primary border-2 hover:bg-primary group transition-colors duration-200">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
              <FileText className="text-primary size-10 group-hover:text-white"/>
              <span className="text-lg font-semibold text-center text-primary group-hover:text-white">
                Ver estado de cuenta
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
